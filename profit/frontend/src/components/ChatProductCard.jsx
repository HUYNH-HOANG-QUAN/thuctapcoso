// =====================================================
// components/ChatProductCard.jsx
// Card ngang hiển thị sản phẩm trong chatbot.
// Dùng chung helper mapProductFromApi để xử lý ảnh / format giá.
// Click card -> đóng widget + điều hướng tới trang chi tiết.
// =====================================================

import { formatPrice, mapProductFromApi } from '../utils/productHelpers';

// Fallback emoji theo category (khi imageUrl null VÀ ảnh local cũng lỗi).
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

/**
 * Props:
 *   - rawProduct : object sản phẩm thô từ chatbot
 *   - onCloseChat: callback đóng widget (optional)
 *   - onNavigate : callback (product) => void để điều hướng (optional).
 *                  Nếu không truyền -> fallback window.location.pathname
 *                  để khớp pattern routing state-based của App.jsx.
 */
const ChatProductCard = ({ rawProduct, onCloseChat, onNavigate }) => {
  const product = mapProductFromApi(rawProduct);
  const fallbackEmoji = pickEmoji(product);

  const handleClick = () => {
    if (onCloseChat) onCloseChat();

    if (onNavigate) {
      onNavigate(product);
      return;
    }

    // Fallback: App.jsx dùng state-based routing, nhưng một số slug (reset-password,
    // banking-qr, /product/...) được nhận qua window.location.pathname trong useEffect.
    // Tuy nhiên App hiện chưa có route "/product/:slug" -> dùng navigate state
    // thông qua CustomEvent để App xử lý.
    const slug = product.slug || product.sku || product.id;
    if (slug) {
      window.dispatchEvent(
        new CustomEvent('profit:navigate-product', {
          detail: { product },
        })
      );
    }
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
              if (
                product.imageFallback &&
                e.currentTarget.src !== product.imageFallback
              ) {
                e.currentTarget.src = product.imageFallback;
              } else {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.classList.add('show-emoji');
              }
            }}
          />
        ) : null}
        <span className="chat-product-card__emoji" aria-hidden="true">
          {fallbackEmoji}
        </span>
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
