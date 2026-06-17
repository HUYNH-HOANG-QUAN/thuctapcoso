"""Retriever từ PGVector — search top-k documents theo similarity.

Pipeline:
    query -> OpenAIEmbeddings -> PGVector.similarity_search -> list[Document]
                                                          -> formatted context string

Vector store đã được nạp sẵn bởi `profit/crawl/ingest_pgvector.py`
(collection = ``PGVECTOR_COLLECTION``).
"""
from __future__ import annotations

import json
from typing import Any

from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector

from config import (
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_MODEL,
    PGVECTOR_COLLECTION,
    PGVECTOR_CONNECTION,
    RETRIEVER_K,
)

# ---- lazy singletons --------------------------------------------------------
# Chỉ khởi tạo khi gọi lần đầu, tránh tốn thời gian/cost lúc import.
_embeddings: OpenAIEmbeddings | None = None
_vectorstore: PGVector | None = None


def _get_embeddings() -> OpenAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = OpenAIEmbeddings(model=OPENAI_EMBEDDING_MODEL)
    return _embeddings


def _get_vectorstore() -> PGVector:
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = PGVector(
            embeddings=_get_embeddings(),
            collection_name=PGVECTOR_COLLECTION,
            connection=PGVECTOR_CONNECTION,
            use_jsonb=True,
        )
    return _vectorstore


def warmup() -> None:
    """Khởi tạo embeddings + vector store sớm để lần search đầu nhanh hơn."""
    _get_vectorstore()


# ---- public API -------------------------------------------------------------
def similarity_search(query: str, k: int | None = None) -> list[Document]:
    """Search top-k documents gần nhất với ``query`` trong PGVector."""
    if not query or not query.strip():
        return []
    top_k = k if k is not None else RETRIEVER_K
    vs = _get_vectorstore()
    # similarity_search_with_relevance_scores trả kèm score, hữu ích cho debug.
    # Ở đây dùng similarity_search cho đơn giản — caller không cần score.
    return vs.similarity_search(query, k=top_k)


def format_context(docs: list[Document]) -> str:
    """Gộp top-k documents thành 1 block text để đưa vào LLM prompt.

    Mỗi doc có cấu trúc:
        - page_content: mô tả sản phẩm (đã được embed)
        - metadata: sku, name, brand, category, price, flavor, ...
        - metadata.attributes: dict JSON string (dùng để nhắc tới thông số kỹ thuật)
    """
    if not docs:
        return "(không có sản phẩm liên quan trong cơ sở dữ liệu)"

    blocks: list[str] = []
    for i, doc in enumerate(docs, start=1):
        meta = dict(doc.metadata or {})
        # attributes được lưu dạng JSON string khi ingest.
        attr_raw = meta.pop("attributes", "")
        try:
            attr_dict: dict[str, Any] = json.loads(attr_raw) if attr_raw else {}
        except (TypeError, ValueError):
            attr_dict = {}

        # Dòng metadata tóm tắt để LLM biết "đây là sản phẩm nào".
        meta_line = " | ".join(
            f"{k}={v}" for k, v in meta.items() if v not in ("", None) and k != "group"
        )
        blocks.append(
            f"[Sản phẩm #{i}] {doc.page_content}\n"
            f"  Metadata: {meta_line}\n"
            f"  Attributes: {json.dumps(attr_dict, ensure_ascii=False)}"
        )
    return "\n\n".join(blocks)


def format_products(docs: list[Document]) -> list[dict[str, Any]]:
    """Convert top-k documents thành list[dict] cho ChatProductCard.

    Shape gần với Product API của frontend Spring Boot để có thể feed thẳng
    vào ``mapProductFromApi`` ở phía React. Các field optional sẽ là chuỗi rỗng
    hoặc ``null`` nếu metadata gốc thiếu — frontend tự xử lý fallback.
    """
    out: list[dict[str, Any]] = []
    for doc in docs:
        meta = dict(doc.metadata or {})
        attr_raw = meta.pop("attributes", "")
        try:
            attr_dict: dict[str, Any] = json.loads(attr_raw) if attr_raw else {}
        except (TypeError, ValueError):
            attr_dict = {}

        raw_image_url = (meta.get("image_url") or "").strip() or None

        out.append(
            {
                # Khoá chính (frontend dùng làm key, điều hướng chi tiết)
                "id": meta.get("sku") or meta.get("id"),
                "sku": meta.get("sku"),
                "slug": meta.get("slug") or meta.get("sku"),
                # Thông tin hiển thị
                "name": meta.get("name") or "",
                "brand": meta.get("brand") or "ProFit",
                "category": meta.get("category") or "",
                "categoryName": meta.get("category") or "Khác",
                "categoryId": meta.get("category_id"),
                "flavor": meta.get("flavor") or "",
                "price": meta.get("price"),
                "oldPrice": meta.get("old_price"),
                # Ảnh: trả null nếu dataset chưa có → frontend dùng fallback category
                "imageUrl": raw_image_url,
                # Sao/review: lấy từ attributes nếu có, không thì 0
                "ratingAvg": attr_dict.get("rating") or attr_dict.get("ratingAvg") or 0,
                "ratingCount": attr_dict.get("reviews") or attr_dict.get("ratingCount") or 0,
                "stockQuantity": attr_dict.get("stock_quantity")
                or attr_dict.get("stockQuantity") or 0,
                "tags": attr_dict.get("tags") or [],
                "shortDescription": doc.page_content or "",
                "isActive": True,
                # Metadata gốc (cho LLM/debug)
                "score": None,  # PGVector mặc định không trả score
                "attributes": attr_dict,
            }
        )
    return out
