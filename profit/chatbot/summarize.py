"""Summarize lịch sử + Rewrite prompt hiện tại (stream) bằng gpt-4o-mini (128k context)."""

from __future__ import annotations

from typing import AsyncIterator

from openai import AsyncOpenAI

from config import OPENAI_API_KEY, OPENAI_CHAT_MODEL


SYSTEM_SUMMARIZE = """Bạn là chuyên gia tóm tắt hội thoại. Nhiệm vụ: nhận lịch sử chat
giữa user và assistant, trả về MỘT đoạn văn bản TÓM TẮT NGẮN GỌN (dưới 200 từ)
gồm: chủ đề user đang quan tâm, thông tin đã trao đổi, trạng thái hội thoại.
CHỈ trả về đoạn tóm tắt, KHÔNG thêm lời dẫn."""


SYSTEM_REWRITE = """Bạn là chuyên gia viết lại prompt cho chatbot tư vấn supplement (ProFit).
Nhiệm vụ: nhận lịch sử đã tóm tắt + câu hỏi mới nhất của user, viết lại thành MỘT prompt
dài, rõ ràng, tự chứa:

1. THAM CHIẾU RÕ: thay đại từ ("nó", "cái đó", "thế còn", "bao nhiêu") bằng nội dung
   cụ thể từ lịch sử tóm tắt.
2. MỞ RỘNG: thêm chi tiết ngữ cảnh, nhu cầu, ràng buộc (giá, mục tiêu tập, sức khỏe...)
   nếu user đã đề cập hoặc suy luận được từ lịch sử.
3. SẠCH: bỏ lời chào, icon, viết tắt gây nhiễu; giữ 1 câu hỏi trọng tâm.

QUY TẮC:
- KHÔNG bịa thông tin user chưa đề cập.
- KHÔNG trả lời câu hỏi, chỉ viết lại prompt.
- KHÔNG thêm tiền tố, chỉ trả về bản prompt đã viết lại bằng tiếng Việt.
- Nếu câu đã rõ ràng và độc lập, trả về nguyên văn.
- NÊN dài hơn câu gốc (1-3 câu), thêm ngữ cảnh phong phú hơn."""


SYSTEM_ANSWER = """Bạn là trợ lý tư vấn supplement chuyên nghiệp của ProFit (tiếng Việt).
Nhiệm vụ: trả lời câu hỏi của khách hàng dựa trên CONTEXT sản phẩm được cung cấp
(từ cơ sở dữ liệu PGVector) + lịch sử hội thoại đã tóm tắt.

NGUYÊN TẮC BẮT BUỘC:
1. CHỈ sử dụng thông tin sản phẩm có trong CONTEXT. Nếu CONTEXT rỗng/không liên quan,
   hãy trả lời lịch sự: "Mình chưa có thông tin sản phẩm phù hợp, bạn có thể mô tả
   thêm nhu cầu được không?" — KHÔNG tự bịa tên sản phẩm, giá, thông số.
2. Khi nhắc tới 1 sản phẩm cụ thể, ưu tiên nêu: TÊN, THƯƠNG HIỆU, GIÁ (nếu có),
   thông số nổi bật (protein/serving, caffeine, lactose-free...).
3. Nếu user hỏi so sánh, hãy so sánh 2-3 sản phẩm nổi bật trong CONTEXT theo
   tiêu chí user quan tâm (giá, mục tiêu tập, thành phần, hương vị...).
4. Trả lời ngắn gọn, dễ đọc, dùng gạch đầu dòng khi liệt kê >2 sản phẩm.
5. Kết thúc bằng 1 câu hỏi gợi mở để tiếp tục tư vấn (ví dụ: "Bạn có đang tập
   tạ hay cardio? Ngân sách dự kiến bao nhiêu?").
6. Cuối câu trả lời KHÔNG thêm các ký tự meta như "[Sản phẩm #1]" — phần đánh
   số chỉ dành cho bạn đọc CONTEXT, user không thấy.
"""


_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client


async def summarize_history(history: list[dict]) -> str:
    """Nén lịch sử hội thoại thành 1 đoạn tóm tắt ngắn (non-stream, dùng để feed cho rewrite)."""
    if not history:
        return "(cuộc trò chuyện mới, chưa có lịch sử)"

    lines = []
    for t in history:
        if t.get("role") == "user":
            lines.append(f"User: {t.get('content', '')}")
        elif t.get("role") == "assistant":
            lines.append(f"Assistant: {t.get('content', '')}")

    conversation = "\n".join(lines) if lines else "(trống)"

    resp = await _get_client().chat.completions.create(
        model=OPENAI_CHAT_MODEL,
        temperature=0.0,
        max_tokens=300,
        messages=[
            {"role": "system", "content": SYSTEM_SUMMARIZE},
            {"role": "user", "content": f"LỊCH SỬ HỘI THOẠI:\n{conversation}"},
        ],
    )
    return (resp.choices[0].message.content or "").strip()


async def stream_rewrite_prompt(current_prompt: str, summary: str) -> AsyncIterator[str]:
    """Stream phiên bản viết lại của prompt hiện tại, từng token từ model.stream()."""
    stream = await _get_client().chat.completions.create(
        model=OPENAI_CHAT_MODEL,
        temperature=0.0,
        max_tokens=600,
        stream=True,
        messages=[
            {"role": "system", "content": SYSTEM_REWRITE},
            {
                "role": "user",
                "content": f"LỊCH SỬ ĐÃ TÓM TẮT:\n{summary}\n\n"
                f"CÂU HỎI MỚI NHẤT CỦA USER:\n{current_prompt}",
            },
        ],
    )
    async for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        token = getattr(delta, "content", None)
        if token:
            yield token


async def stream_answer(
    rewritten_prompt: str,
    context: str,
    history_summary: str,
) -> AsyncIterator[str]:
    """Stream câu trả lời cuối cùng cho user.

    Inputs:
        rewritten_prompt : prompt đã được rewrite sạch, có đủ ngữ cảnh.
        context          : block text gộp từ top-k documents lấy từ PGVector.
        history_summary  : tóm tắt lịch sử hội thoại trước đó (nếu có).
    """
    user_msg_parts: list[str] = []
    if history_summary and history_summary.strip() and history_summary != "(cuộc trò chuyện mới, chưa có lịch sử)":
        user_msg_parts.append(f"LỊCH SỬ ĐÃ TÓM TẮT:\n{history_summary}")
    user_msg_parts.append(f"CÂU HỎI CỦA KHÁCH (đã viết lại):\n{rewritten_prompt}")
    user_msg_parts.append(
        "CONTEXT SẢN PHẨM TỪ CƠ SỞ DỮ LIỆU (chỉ dùng thông tin này, "
        "không bịa thêm):\n"
        f"{context}"
    )
    user_msg = "\n\n".join(user_msg_parts)

    stream = await _get_client().chat.completions.create(
        model=OPENAI_CHAT_MODEL,
        temperature=0.4,
        max_tokens=900,
        stream=True,
        messages=[
            {"role": "system", "content": SYSTEM_ANSWER},
            {"role": "user", "content": user_msg},
        ],
    )
    async for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        token = getattr(delta, "content", None)
        if token:
            yield token