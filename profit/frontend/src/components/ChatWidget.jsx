import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Loader2, MessageCircle } from 'lucide-react';
import './ChatWidget.css';
import ChatProductCard from './ChatProductCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/ProFitSuppsDB';
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: `Xin chào! 👋 Mình là trợ lý ảo của ProFit. Mình có thể giúp bạn:

• Tư vấn về sản phẩm protein, creatine, pre-workout
• Thông tin về chính sách đổi trả, vận chuyển
• Giờ mở cửa showroom
• Chương trình tích điểm thành viên
• Cách sử dụng sản phẩm

Bạn cần hỏi gì nào? 😊`
};

const ChatWidget = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleStreamResponse = async (userMessage, assistantMessageId) => {
    try {
      const response = await fetch(`${CHAT_API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          thread_id: `web_${Date.now()}`,
          user_id: 'web_user',
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';
      let currentEvent = 'message';
      let pendingProducts = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const raw = line.slice(5).trim();
            if (!raw) continue;

            if (currentEvent === 'products') {
              try {
                pendingProducts = JSON.parse(raw);
              } catch (e) {
                console.error('Parse products failed', e);
              }
            } else if (currentEvent === 'token') {
              fullResponse += raw;
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullResponse, products: msg.products || pendingProducts }
                  : msg
              ));
            } else if (currentEvent === 'error') {
              throw new Error(raw);
            } else {
              // event=meta / message -> bỏ qua ở frontend
            }
          } else if (line.trim() === '') {
            currentEvent = 'message';
          }
        }
      }

      if (pendingProducts) {
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId && !msg.products
            ? { ...msg, products: pendingProducts }
            : msg
        ));
      }

      return fullResponse;
    } catch (err) {
      console.error('Stream error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    const assistantMsg = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    try {
      await handleStreamResponse(userMessage, assistantMsg.id);
    } catch (err) {
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMsg.id
          ? { ...msg, content: 'Xin lỗi, mình đang gặp trục trặc kỹ thuật. Bạn có thể thử lại sau hoặc liên hệ hotline 1900 6868 để được hỗ trợ trực tiếp nhé!' }
          : msg
      ));
      setError('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setIsMinimized(false);
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(prev => !prev);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-widget-container ${className}`}>
      {/* Toggle Button */}
      <button
        className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="chat-toggle-badge">1</span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <Bot size={20} />
            </div>
            <div className="chat-header-text">
              <h3>ProFit Assistant</h3>
              <span className="chat-status">
                <span className="status-dot"></span>
                Đang trực tuyến
              </span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              className="chat-action-btn"
              onClick={toggleMinimize}
              aria-label={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              className="chat-action-btn"
              onClick={toggleChat}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role} ${!message.content && isLoading && message.role === 'assistant' && message.id === messages[messages.length - 1]?.id ? 'loading' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="message-avatar">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i}>{line || <br />}</p>
                      ))}
                      {Array.isArray(message.products) && message.products.length > 0 && (
                        <div className="chat-product-list">
                          {message.products.map((p) => (
                            <ChatProductCard
                              key={p.id || p.sku}
                              rawProduct={p}
                              onCloseChat={() => setIsOpen(false)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {message.timestamp && (
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="message-avatar user">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble typing">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="message error">
                  <div className="message-bubble error">
                    {error}
                    <button
                      className="retry-btn"
                      onClick={() => {
                        setError(null);
                        const lastUserMsg = messages.filter(m => m.role === 'user').pop();
                        if (lastUserMsg) {
                          setMessages(prev => prev.filter(m => m.id !== messages[messages.length - 1]?.id));
                          setInputValue(lastUserMsg.content);
                        }
                      }}
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-form" onSubmit={handleSubmit}>
              <div className="chat-input-wrapper">
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu hỏi của bạn..."
                  rows={1}
                  disabled={isLoading}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Gửi"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              <p className="chat-disclaimer">
                ProFit Assistant có thể đưa ra thông tin không chính xác. Hãy kiểm chứng trước khi sử dụng.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
