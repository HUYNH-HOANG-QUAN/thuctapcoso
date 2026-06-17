"""Retriever từ PGVector — search top-k documents theo similarity.

Pipeline:
    query -> OpenAIEmbeddings -> PGVector.similarity_search -> list[Document]
                                                          -> formatted context string
                                                          -> enrich với Spring Boot API -> format_products

Vector store đã được nạp sẵn bởi `profit/crawl/ingest_pgvector.py`
(collection = ``PGVECTOR_COLLECTION``).
"""
from __future__ import annotations

import json
import logging
from typing import Any

import requests
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector

from config import (
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_MODEL,
    PRODUCT_API_BASE_URL,
    PGVECTOR_COLLECTION,
    PGVECTOR_CONNECTION,
    RETRIEVER_K,
)

_log = logging.getLogger(__name__)

# ---- lazy singletons --------------------------------------------------------
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


# ---- product enrichment từ Spring Boot API ---------------------------------
def _fetch_products_by_skus(skus: list[str]) -> dict[str, dict[str, Any]]:
    """Gọi GET /api/v1/products/batch?skus=PTS-W01,PTS-W02...

    Trả về dict mapping sku -> product response dict.
    Nếu API fail -> trả dict rỗng (fallback về PGVector metadata).
    """
    if not skus:
        return {}

    try:
        resp = requests.get(
            f"{PRODUCT_API_BASE_URL}/batch",
            params={"skus": skus},
            timeout=5,
            headers={"Accept": "application/json"},
        )
        resp.raise_for_status()
        items: list[dict[str, Any]] = resp.json()
        return {item.get("sku") or item.get("id"): item for item in items}
    except Exception as exc:  # noqa: BLE001
        _log.warning("[retriever] Spring Boot product API failed: %s — falling back to PGVector metadata", exc)
        return {}


# ---- public API -------------------------------------------------------------
def similarity_search(query: str, k: int | None = None) -> list[Document]:
    """Search top-k documents gần nhất với ``query`` trong PGVector."""
    if not query or not query.strip():
        return []
    top_k = k if k is not None else RETRIEVER_K
    vs = _get_vectorstore()
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
        attr_raw = meta.pop("attributes", "")
        try:
            attr_dict: dict[str, Any] = json.loads(attr_raw) if attr_raw else {}
        except (TypeError, ValueError):
            attr_dict = {}

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

    Ưu tiên dùng dữ liệu đầy đủ từ Spring Boot API (ảnh, rating, tags...).
    Nếu API fail, fallback về metadata trong PGVector.
    """
    if not docs:
        return []

    # 1. Thu thập SKUs từ PGVector
    skus: list[str] = []
    for doc in docs:
        sku = doc.metadata.get("sku") if doc.metadata else None
        if sku:
            skus.append(sku)

    # 2. Enrich bằng Spring Boot API
    api_products: dict[str, dict[str, Any]] = {}
    if skus:
        api_products = _fetch_products_by_skus(skus)

    # 3. Build output: ưu tiên API data, fallback PGVector metadata
    out: list[dict[str, Any]] = []
    for doc in docs:
        sku = (doc.metadata or {}).get("sku")
        api_item = api_products.get(sku) if sku else None

        if api_item:
            # Spring Boot trả đầy đủ → dùng trực tiếp
            out.append(dict(api_item))
        else:
            # API miss hoặc fail → dùng PGVector metadata
            meta = dict(doc.metadata or {})
            attr_raw = meta.pop("attributes", "")
            try:
                attr_dict: dict[str, Any] = json.loads(attr_raw) if attr_raw else {}
            except (TypeError, ValueError):
                attr_dict = {}

            out.append(
                {
                    "id": sku or meta.get("id"),
                    "sku": sku,
                    "slug": meta.get("slug") or sku,
                    "name": meta.get("name") or "",
                    "brand": meta.get("brand") or "ProFit",
                    "category": meta.get("category") or "",
                    "categoryName": meta.get("category") or "Khác",
                    "categoryId": meta.get("category_id"),
                    "flavor": meta.get("flavor") or "",
                    "price": meta.get("price"),
                    "oldPrice": meta.get("old_price"),
                    "imageUrl": None,
                    "ratingAvg": attr_dict.get("rating") or 0,
                    "ratingCount": attr_dict.get("reviews") or 0,
                    "stockQuantity": attr_dict.get("stock_quantity") or 0,
                    "tags": attr_dict.get("tags") or [],
                    "shortDescription": doc.page_content or "",
                    "isActive": True,
                    "attributes": attr_dict,
                }
            )

    return out
