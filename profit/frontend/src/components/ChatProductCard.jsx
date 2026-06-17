// =====================================================
// components/ChatProductCard.jsx
// Card ngang hiển thị sản phẩm trong chatbot.
// Dùng chung helper mapProductFromApi để xử lý ảnh / format giá.
// Click card -> đóng widget + điều hướng /product/:slug.
// =====================================================

import { useNavigate } from 'react-router-dom';
import { formatPrice, mapProductFromApi } from '../utils/productHelpers';

// Fallback emoji theo category (dùng khi imageUrl null VÀ ảnh local cũng lỗi).
const CATEGORY_EMOJI = {
  whey: '🥛',
  creatine: '💪',
  pre: '⚡',
  preworkout: '⚡',
  vitamin: '💊',
  bcaa: '💊',
  meal: '🥗',
  bar: '🍫',
  protein: '🥛',
};

const pickEmoji = (product) => {
  const cat = (product.categoryName || product.category || '').toLowerCase();
  for (const key of Object.keys(CATEGORY_EMOJI)) {
    if (cat.includes(key)) return CATEGORY_EMOJI[key];
  }
  return '🛒';
};

const ChatProductCard = ({ rawProduct, onCloseChat }) => {
  const navigate = useNavigate();

  // Chuẩn hoá dữ liệu từ chatbot về cùng shape với Product API.
  // mapProductFromApi xử lý luôn: /uploads/... join API_BASE_URL,
  // absolute URL giữ nguyên, fallback ảnh local theo category.
  const product = mapProductFromApi(rawProduct);
  const fallbackEmoji = pickEmoji(product);

  const handleClick = () => {
    const slug = product.slug || product.sku || product.id;
    if (onCloseChat) onCloseChat();
    if (slug) navigate(`/product/${slug}`);
  };

  return (
    <div
      className="chat-product-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="chat-product-card__img">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              // Ảnh chính lỗi -> fallback ảnh category (đã set sẵn trong imageFallback)
              if (e.currentTarget.src !== product.imageFallback && product.imageFallback) {
                e.currentTarget.src = product.imageFallback;
              } else {
                // Cả fallback cũng lỗi -> ẩn img, hiện emoji
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.dataset.fallback = 'true';
              }
            }}
          />
        ) : (
          <span className="chat-product-card__emoji" aria-hidden="true">
            {fallbackEmoji}
          </span>
        )}
        {!product.image && null}
      </div>

      <div className="chat-product-card__body">
        <div className="chat-product-card__brand">{product.brand}</div>
        <div className="chat-product-card__name" title={product.name}>
          {product.name}
        </div>
        <div className="chat-product-card__row">
          <span className="chat-product-card__price">
            {formatPrice(product.price)}
            {product.oldPrice ? (
              <span className="chat-product-card__price-old">
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
          </span>
          {product.inStock ? (
            <span className="chat-product-card__stock">Còn hàng</span>
          ) : (
            <span className="chat-product-card__stock out">Hết hàng</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatProductCard;
