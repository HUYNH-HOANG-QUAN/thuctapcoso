"""FastAPI chatbot — RAG pipeline: summarize -> rewrite -> retrieve (PGVector) -> respond.

Protocol khớp ChatWidget (frontend):
  POST /chat/stream   body: { message, thread_id, user_id, history? }
  -> SSE: event=meta     data={"summary": "...", "stage": "..."}
          event=token    data="<char>"            (stream từng ký tự câu trả lời cuối)
          event=products  data=[{...}, ...]       (top-k sản phẩm retrieve được, gửi 1 lần)
          event=done      data={"final": "...", "summary": "...", "products": [...]}
"""

from __future__ import annotations

import asyncio
import json
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from openai import APIError

from config import OPENAI_API_KEY, PGVECTOR_COLLECTION, PGVECTOR_CONNECTION, RETRIEVER_K
from retriever import format_context, format_products, similarity_search, warmup
from summarize import stream_answer, stream_rewrite_prompt, summarize_history

app = FastAPI(title="ProFit Chatbot", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _sse(event: str, data) -> bytes:
    if isinstance(data, (dict, list)):
        payload = json.dumps(data, ensure_ascii=False)
    else:
        payload = str(data)
    return f"event: {event}\ndata: {payload}\n\n".encode("utf-8")


@app.on_event("startup")
async def _startup() -> None:
    """Pre-warm vector store để search lần đầu không bị cold start."""
    try:
        warmup()
    except Exception as e:  # noqa: BLE001
        # Không chặn startup; retriever sẽ fail-fast khi search nếu PG chưa lên.
        print(f"[startup] warmup vector store failed: {e}")


@app.get("/health")
async def health():
    return JSONResponse(
        {
            "status": "ok",
            "openai_key_set": bool(OPENAI_API_KEY) and not OPENAI_API_KEY.startswith("<"),
            "pgvector_connection_set": bool(PGVECTOR_CONNECTION),
            "pgvector_collection": PGVECTOR_COLLECTION,
            "retriever_k": RETRIEVER_K,
        }
    )


@app.post("/chat/stream")
async def chat_stream(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    message = (body.get("message") or "").strip()
    history = body.get("history") or []
    thread_id = body.get("thread_id") or "web"
    user_id = body.get("user_id") or "web_user"

    if not message:
        async def _err():
            yield _sse("error", "message is required")
        return StreamingResponse(_err(), media_type="text/event-stream")

    if not OPENAI_API_KEY or OPENAI_API_KEY.startswith("<"):
        async def _no_key():
            yield _sse("error", "OPENAI_API_KEY chưa cấu hình trong chatbot/.env")
        return StreamingResponse(_no_key(), media_type="text/event-stream")

    async def _stream() -> AsyncIterator[bytes]:
        # ---- Phase 1: summarize lịch sử ----------------------------------
        try:
            yield _sse("meta", {"thread_id": thread_id, "user_id": user_id, "stage": "summarize"})
            summary = await summarize_history(history)
            yield _sse("meta", {"stage": "summarize_done", "summary": summary})
        except APIError as e:
            yield _sse("error", f"Summarize lỗi OpenAI: {e}")
            return
        except Exception as e:
            yield _sse("error", f"Summarize thất bại: {e}")
            return

        # ---- Phase 2: rewrite prompt (giữ nguyên phase cũ) ---------------
        rewritten_parts: list[str] = []
        try:
            yield _sse("meta", {"stage": "rewrite"})
            async for token in stream_rewrite_prompt(message, summary):
                rewritten_parts.append(token)
            rewritten = "".join(rewritten_parts).strip() or message
            yield _sse("meta", {"stage": "rewrite_done", "rewritten": rewritten})
        except APIError as e:
            yield _sse("error", f"Rewrite lỗi OpenAI: {e}")
            return
        except Exception as e:
            yield _sse("error", f"Rewrite thất bại: {e}")
            return

        # ---- Phase 3: retrieve từ PGVector --------------------------------
        # Dùng rewritten prompt (đã clean + có đủ context) để search chính xác hơn.
        try:
            yield _sse("meta", {"stage": "retrieve", "query": rewritten})
            docs = similarity_search(rewritten, k=RETRIEVER_K)
            context = format_context(docs)
            products = format_products(docs)
            yield _sse(
                "meta",
                {
                    "stage": "retrieve_done",
                    "num_docs": len(docs),
                    "context_chars": len(context),
                },
            )
            # Gửi 1 event products để frontend render card sản phẩm (nếu có).
            if products:
                yield _sse("products", products)
        except Exception as e:
            # Lỗi retrieve KHÔNG chặn response — vẫn cho LLM trả lời với context rỗng
            # (LLM sẽ nói "chưa có thông tin phù hợp" theo SYSTEM_ANSWER).
            yield _sse("error", f"Retrieve lỗi (vẫn tiếp tục trả lời): {e}")
            context = "(lỗi truy xuất cơ sở dữ liệu, không có context sản phẩm)"
            products = []

        # ---- Phase 4: stream câu trả lời cuối ----------------------------
        answer_parts: list[str] = []
        try:
            yield _sse("meta", {"stage": "respond"})
            async for token in stream_answer(rewritten, context, summary):
                answer_parts.append(token)
                # stream từng ký tự để UI hiển thị "từng chữ một".
                for ch in token:
                    yield _sse("token", ch)
                    await asyncio.sleep(0.008)
        except APIError as e:
            yield _sse("error", f"Respond lỗi OpenAI: {e}")
            return
        except Exception as e:
            yield _sse("error", f"Respond thất bại: {e}")
            return

        final = "".join(answer_parts).strip()
        yield _sse(
            "done",
            {
                "final": final,
                "summary": summary,
                "rewritten": rewritten,
                "products": products,
            },
        )

    return StreamingResponse(
        _stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9876)
