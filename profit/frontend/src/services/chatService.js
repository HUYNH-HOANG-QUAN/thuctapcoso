import axios from 'axios';

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000';

const chatApi = axios.create({
  baseURL: CHAT_API_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessage = async (message, threadId = null, userId = 'web_user') => {
  try {
    const response = await chatApi.post('/chat', {
      message,
      thread_id: threadId || `web_${Date.now()}`,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
};

export const streamMessage = async (message, threadId = null, userId = 'web_user', onChunk, onComplete, onError) => {
  const controller = new AbortController();

  try {
    const response = await fetch(`${CHAT_API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        thread_id: threadId || `web_${Date.now()}`,
        user_id: userId,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk?.(chunk, fullResponse);
    }

    onComplete?.(fullResponse);
    return fullResponse;
  } catch (error) {
    if (error.name !== 'AbortError') {
      onError?.(error);
    }
    throw error;
  }
};

export const getChatHistory = async (threadId, userId = 'web_user') => {
  try {
    const response = await chatApi.get(`/chat/history/${threadId}`, {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error('Get history error:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await chatApi.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    return { status: 'error', message: error.message };
  }
};

export default chatApi;
