// =====================================================
// components/ProductCard.jsx – Card hiển thị sản phẩm
// Props:
//   - product: object dữ liệu sản phẩm
//   - onAddToCart: hàm thêm vào giỏ
//   - onViewDetail: hàm xem chi tiết
// =====================================================

import { useEffect, useState } from "react";
import { formatPrice, renderStars } from "../utils/productHelpers";

const ProductCard = ({ product, onAddToCart, onViewDetail }) => {
  const [imageSrc, setImageSrc] = useState(product.image);

  useEffect(() => {
    setImageSrc(product.image);
  }, [product.image]);

  return (
    <div className="product-card" onClick={() => onViewDetail(product)}>
      {/* Ảnh / Emoji sản phẩm */}
      <div className="product-img-wrap">
        {product.badge === "SALE" && <span className="badge-sale">SALE</span>}
        {product.badge === "NEW" && <span className="badge-new">MỚI</span>}
        <img
          src={imageSrc}
          alt={product.name}
          onError={() => {
            if (imageSrc !== product.imageFallback) {
              setImageSrc(product.imageFallback);
            }
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "12px",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>
        {product.categoryName && (
          <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 6 }}>
            {product.categoryName}
          </div>
        )}
        {Array.isArray(product.tags) && product.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(234,179,8,0.45)",
                  color: "var(--primary)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Đánh giá sao */}
        <div className="product-rating">
          <span className="stars">{renderStars(product.rating)}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>

        {/* Giá & nút thêm giỏ */}
        <div className="product-footer">
          <div>
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="product-price-old">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Nút "+" – ngăn sự kiện click ra ngoài card */}
          <button
            className="btn-add"
            onClick={(e) => {
              e.stopPropagation(); // không trigger onViewDetail
              if (product.inStock) {
                onAddToCart(product);
              }
            }}
            title={product.inStock ? "Thêm vào giỏ" : "Hết hàng"}
            style={{ opacity: product.inStock ? 1 : 0.4 }}
          >
            +
          </button>
        </div>

        {/* Trạng thái hết hàng */}
        {!product.inStock && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#ef4444",
              fontWeight: 700,
            }}
          >
            Tạm hết hàng
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
