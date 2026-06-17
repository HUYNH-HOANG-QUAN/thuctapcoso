// =====================================================
// pages/ProductDetailPage.jsx – Chi tiết sản phẩm Premium
// =====================================================

import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Reviews from "../components/Reviews";
import { getProductsFromApi } from "../services/productService";
import { formatPrice, mapProductFromApi, renderStars } from "../utils/productHelpers";

const ProductDetailPage = ({ product, onAddToCart, onViewDetail, navigate }) => {
  if (!product) {
    return (
      <div className="section">
        <div className="empty-state">
          <h3>Không tìm thấy sản phẩm</h3>
          <button className="btn-primary" onClick={() => navigate("products")}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState(
    (product.flavors && product.flavors[0]) || "Mặc định"
  );
  const [imageSrc, setImageSrc] = useState(product.image);
  const [related, setRelated] = useState([]);
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
  });
  const [added, setAdded] = useState(false);

  const totalPrice = product.price * quantity;
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  useEffect(() => {
    setImageSrc(product.image);
    setQuantity(1);
  }, [product.id]);

  useEffect(() => {
    let isMounted = true;
    const loadRelatedProducts = async () => {
      if (!product.categoryId) { setRelated([]); return; }
      try {
        const page = await getProductsFromApi({ categoryId: product.categoryId, page: 0, size: 12 });
        if (!isMounted) return;
        const relatedProducts = page.content
          .map(mapProductFromApi)
          .filter((p) => p.id !== product.id)
          .slice(0, 4);
        setRelated(relatedProducts);
      } catch (error) {
        console.error("Không thể tải sản phẩm liên quan:", error);
      }
    };
    loadRelatedProducts();
    return () => { isMounted = false; };
  }, [product.id, product.categoryId]);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate("home")}>Trang chủ</span>
        <span> / </span>
        <span onClick={() => navigate("products")}>Sản phẩm</span>
        <span> / </span>
        <span style={{ color: "var(--primary)" }}>{product.name}</span>
      </div>

      {/* ===== CHI TIẾT ===== */}
      <section className="section">
        <div className="detail-layout">
          {/* Cột trái: ảnh */}
          <div className="detail-image-wrap">
            {discount && (
              <div className="detail-discount">-{discount}%</div>
            )}
            <img
              className="detail-product-image"
              src={imageSrc}
              srcSet={imageSrc === product.image ? product.imageSrcSet || undefined : undefined}
              sizes="(max-width: 992px) 100vw, 50vw"
              alt={product.name}
              onError={() => {
                if (imageSrc !== product.imageFallback) setImageSrc(product.imageFallback);
              }}
            />
          </div>

          {/* Cột phải: thông tin */}
          <div>
            {/* Brand */}
            <div style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 12,
              color: "var(--primary)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: 10,
            }}>
              {product.brand}
            </div>

            <h1 className="detail-title">{product.name}</h1>

            {/* Category */}
            {product.categoryName && (
              <div style={{ color: "var(--gray)", marginBottom: 10, fontSize: 14 }}>
                Danh mục: <strong style={{ color: "var(--white)" }}>{product.categoryName}</strong>
              </div>
            )}

            {/* Tags */}
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {product.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,92,0,0.25)",
                    color: "var(--primary)",
                    fontWeight: 700,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ color: "#f59e0b", fontSize: 15 }}>{renderStars(product.rating)}</span>
              <span style={{ fontSize: 13, color: "var(--gray)" }}>({product.reviews} đánh giá)</span>
              <span style={{
                width: 2, height: 12, background: "rgba(255,255,255,0.1)", borderRadius: 1, margin: "0 4px",
              }} />
              {product.inStock ? (
                <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13 }}>
                  ✓ Còn hàng
                </span>
              ) : (
                <span style={{ color: "var(--red)", fontWeight: 700, fontSize: 13 }}>✗ Hết hàng</span>
              )}
            </div>

            {/* Giá */}
            <div className="detail-price-wrap">
              <span className="detail-price">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="detail-price-old">{formatPrice(product.oldPrice)}</span>
                  <span style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "var(--red)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Mô tả */}
            <p className="detail-desc">{product.fullDesc}</p>

            {/* Thông số */}
            <div className="detail-specs">
              <div className="spec-item">
                <span>⚖️ Trọng lượng</span>
                <strong>{product.weight}</strong>
              </div>
              <div className="spec-item">
                <span>🥄 Khẩu phần</span>
                <strong>{product.servings} lần dùng</strong>
              </div>
              <div className="spec-item">
                <span>⭐ Đánh giá</span>
                <strong>{product.rating}/5</strong>
              </div>
            </div>

            {/* Chọn hương vị */}
            {product.flavors && product.flavors.length > 1 && (
              <div className="detail-flavors">
                <div className="detail-label">Hương vị:</div>
                <div className="flavor-list">
                  {product.flavors.map((f) => (
                    <button
                      key={f}
                      className={`flavor-btn ${selectedFlavor === f ? "active" : ""}`}
                      onClick={() => setSelectedFlavor(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Số lượng */}
            <div className="detail-quantity">
              <div className="detail-label">Số lượng:</div>
              <div className="quantity-control">
                <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <span style={{ color: "var(--gray)", fontSize: 14 }}>
                Tổng:{" "}
                <strong style={{ color: "var(--primary)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>
                  {formatPrice(totalPrice)}
                </strong>
              </span>
            </div>

            {/* Nút hành động */}
            <div className="detail-actions">
              <button
                className="btn-primary"
                style={{ flex: 1, padding: "16px 0", fontSize: 16 }}
                disabled={!product.inStock}
                onClick={() => {
                  handleAdd();
                  navigate("cart");
                }}
              >
                🛒 Mua ngay
              </button>
              <button
                className="btn-outline"
                style={{ flex: 1, padding: "16px 0", fontSize: 16, transition: "all 0.3s" }}
                disabled={!product.inStock}
                onClick={handleAdd}
              >
                {added ? "✓ Đã thêm!" : "+ Thêm giỏ hàng"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ĐÁNH GIÁ ===== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <Reviews productId={product.id} user={user} />
      </section>

      {/* ===== SẢN PHẨM LIÊN QUAN ===== */}
      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <h2 className="section-title">SẢN PHẨM <span>LIÊN QUAN</span></h2>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onViewDetail={onViewDetail} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
