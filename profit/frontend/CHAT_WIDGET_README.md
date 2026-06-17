# ProFit Chat Widget - Integration Guide

## Overview

Production-ready chat widget with RAG (Retrieval-Augmented Generation) integration for ProFit e-commerce website. Features:

- **Toggle Open/Close** - Chat button that expands to a full chat window
- **Streaming Responses** - Real-time streaming from LLM (non-blocking)
- **Async/Await** - Web page remains responsive while chatbot thinks
- **Beautiful UI** - Modern design with typing indicators, message animations
- **Dark Mode Support** - Automatically adapts to system theme
- **Mobile Responsive** - Works on all screen sizes

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │ ChatWidget   │───▶│ chatService  │───▶│  SSE Stream  │ │
│  │ (React)     │    │              │    │              │ │
│  └──────────────┘    └──────────────┘    └──────┬───────┘ │
└─────────────────────────────────────────────────┼───────────┘
                                                  │
                    ┌─────────────────────────────▼───────────┐
                    │            Backend (FastAPI)              │
                    │  ┌──────────────┐    ┌───────────────┐  │
                    │  │ /chat/stream │───▶│ LangGraph     │  │
                    │  │ SSE Endpoint │    │ Agent (RAG)   │  │
                    │  └──────────────┘    └───────┬───────┘  │
                    └───────────────────────────────┼───────────┘
                                                    │
                    ┌───────────────────────────────▼───────────┐
                    │           Vector Store (PGVector)         │
                    │  • products.json                          │
                    │  • nutrition.json                         │
                    │  • general.json                           │
                    │  • faq_policy.json                       │
                    │  • order.json                            │
                    └───────────────────────────────────────────┘
```

## Quick Start

### 1. Backend Setup (Chatbot API)

```bash
# Navigate to chatbot directory
cd chatbot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure .env
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-key-here

# Start the API server
uvicorn agentic_rag.api.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Copy .env.example to .env
cp .env.example .env

# Start development server
npm run dev
```

### 3. Access the Chat Widget

Open your browser to `http://localhost:5173` (or your Vite dev URL). The chat widget will appear in the bottom-right corner.

## Configuration

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Backend API (existing)
VITE_API_BASE_URL=http://localhost:8080/ProFitSuppsDB

# Chatbot API (RAG)
VITE_CHAT_API_URL=http://localhost:8000
```

### Backend Environment Variables

Create a `.env` file in the `chatbot` directory:

```env
# Required
OPENAI_API_KEY=sk-your-openai-key

# Optional - defaults shown
OPENAI_CHAT_MODEL=gpt-5-nano
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# PGVector (optional - for production retrieval)
PGVECTOR_CONNECTION=postgresql+psycopg://langchain:langchain@localhost:6024/langchain
PGVECTOR_COLLECTION=my_docs
ALLOW_DEMO_RETRIEVER=true
```

## API Endpoints

### POST `/chat/stream/simple`

Simple SSE streaming endpoint for real-time responses.

**Request:**
```json
{
  "message": "Whey protein tốt nhất cho người gầy?",
  "thread_id": "web_123456789",
  "user_id": "web_user"
}
```

**Response:** Server-Sent Events (SSE)
```
data: Dạ
data: whey
data: protein
data: tăng cân...
data: [DONE]
```

### POST `/chat`

Full response endpoint with RAG retrieval.

**Response:**
```json
{
  "answer": "Dạ whey protein tốt nhất cho người gầy...",
  "route_id": "product",
  "products": [...],
  "history": [...],
  "latency_ms": 1234
}
```

### GET `/health`

Health check endpoint.

## Dataset Structure

The chatbot uses JSON datasets for RAG:

| Dataset | Description |
|---------|-------------|
| `products.json` | Product catalog (name, price, category, etc.) |
| `nutrition.json` | Nutrition information |
| `general.json` | General FAQ (store hours, contact, etc.) |
| `faq_policy.json` | Policies (shipping, returns, payment) |
| `order.json` | Order-related questions |

## Features

### Streaming Response

The widget streams responses token-by-token from the LLM:

```javascript
// Frontend handles streaming
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Update UI with each chunk
  setMessages(prev => [...prev, newChunk]);
}
```

### Non-Blocking Chat

The chat does NOT block the main thread. While the LLM is thinking:

1. User can continue browsing the website
2. Typing indicator shows "bot is typing"
3. Response streams in as it becomes available
4. Page remains fully interactive

### Chat History

The widget maintains conversation history per session:

- Uses `thread_id` to track conversations
- Remembers previous messages within a session
- History is stored server-side via LangGraph checkpointer

## Customization

### Change Brand Name

Edit `ChatWidget.jsx`:
```javascript
const WELCOME_MESSAGE = {
  // ... update welcome message
};

// In header:
<h3>ProFit Assistant</h3>
```

### Change Primary Color

Edit `ChatWidget.css`:
```css
:root {
  --chat-primary: #4f46e5;  /* Change this */
  --chat-primary-hover: #4338ca;
}
```

### Update Welcome Message

Edit the `WELCOME_MESSAGE` constant in `ChatWidget.jsx`.

## Troubleshooting

### "API request failed" Error

1. Check if backend is running: `curl http://localhost:8000/health`
2. Verify `VITE_CHAT_API_URL` in frontend `.env`
3. Check browser console for CORS errors

### No Response from Chatbot

1. Verify `OPENAI_API_KEY` is set in chatbot `.env`
2. Check if PGVector is running (for production retrieval)
3. Set `ALLOW_DEMO_RETRIEVER=true` for testing without PGVector

### Streaming Not Working

1. Check if `sse-starlette` is installed: `pip show sse-starlette`
2. Verify browser supports SSE (all modern browsers do)
3. Check network tab for CORS issues

## Production Deployment

### Backend

```bash
# Use gunicorn with uvicorn workers
pip install gunicorn
gunicorn agentic_rag.api.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend

```bash
# Build for production
npm run build

# Serve with nginx or similar
```

### Security Considerations

1. **API Keys**: Never commit `.env` files
2. **Rate Limiting**: Add rate limiting to chat endpoints
3. **CORS**: Configure allowed origins for production
4. **Input Validation**: Messages are validated on frontend

## License

Internal use - ProFit Vietnam
