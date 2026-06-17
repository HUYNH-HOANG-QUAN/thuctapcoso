// =====================================================
// pages/CartPage.jsx – Trang giỏ hàng Premium
// =====================================================

import { formatPrice } from "../utils/productHelpers";
import { ShoppingCart } from "lucide-react";

const CartPage = ({ cart, onUpdateQty, onRemove, navigate }) => {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="section">
        <div className="empty-state">
          <div className="empty-icon">
            <ShoppingCart size={72} color="var(--primary)" />
          </div>
          <h3>Giỏ hàng trống</h3>
          <p>Bạn chưa thêm sản phẩm nào. Hãy bắt đầu mua sắm!</p>
          <button className="btn-primary" onClick={() => navigate("products")}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-hero">
        <h1>GIỎ <span>HÀNG</span></h1>
        <p>{cart.length} sản phẩm đang chờ bạn thanh toán</p>
      </div>

      <section className="section">
        <div className="cart-layout">
          {/* Danh sách sản phẩm */}
          <div className="cart-items">
            <div className="cart-header">
              <span>Sản phẩm</span>
              <span>Giá</span>
              <span>Số lượng</span>
              <span>Thành tiền</span>
              <span></span>
            </div>

            {cart.map((item) => (
              <div className="cart-row" key={item.product.id}>
                {/* Ảnh + tên */}
                <div className="cart-product">
                  <div style={{
                    background: "rgba(255,92,0,0.06)",
                    borderRadius: "var(--radius-md)",
                    padding: 8,
                    border: "1px solid rgba(255,92,0,0.08)",
                  }}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: 52, height: 52, objectFit: "contain" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div>
                    <div className="cart-name">{item.product.name}</div>
                    <div className="cart-brand">{item.product.brand}</div>
                  </div>
                </div>

                {/* Giá đơn */}
                <div className="cart-price">{formatPrice(item.product.price)}</div>

                {/* Số lượng */}
                <div className="quantity-control">
                  <button className="qty-btn" onClick={() => onUpdateQty(item.product.id, item.qty - 1)}>−</button>
                  <span className="qty-value">{item.qty}</span>
                  <button className="qty-btn" onClick={() => onUpdateQty(item.product.id, item.qty + 1)}>+</button>
                </div>

                {/* Thành tiền */}
                <div style={{
                  color: "var(--primary)",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 22,
                  textShadow: "0 0 12px rgba(255,92,0,0.2)",
                }}>
                  {formatPrice(item.product.price * item.qty)}
                </div>

                {/* Xóa */}
                <button
                  className="btn-danger"
                  onClick={() => onRemove(item.product.id)}
                  style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", fontSize: 16, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>

          {/* Tóm tắt */}
          <div className="cart-summary">
            <h3 className="summary-title">Tóm tắt đơn hàng</h3>

            {/* Order summary rows */}
            {[
              { label: "Tạm tính", value: formatPrice(subtotal) },
              {
                label: "Phí vận chuyển",
                value: shipping === 0 ? "Miễn phí" : formatPrice(shipping),
                highlight: shipping === 0,
              },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="summary-row">
                <span>{label}</span>
                <span style={{ color: highlight ? "var(--green)" : "inherit", fontWeight: highlight ? 700 : 400 }}>
                  {value}
                </span>
              </div>
            ))}

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Free ship hint */}
            {shipping > 0 && (
              <div style={{
                background: "rgba(34,197,94,0.06)",
                border: "1px dashed rgba(34,197,94,0.2)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                marginTop: 12,
                fontSize: 13,
                color: "var(--gray)",
                textAlign: "center",
                lineHeight: 1.7,
              }}>
                🚚 Mua thêm{" "}
                <strong style={{ color: "var(--primary)" }}>
                  {formatPrice(500000 - subtotal)}
                </strong>{" "}
                để miễn phí vận chuyển
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%", padding: "16px 0", marginTop: 20, fontSize: 16, boxShadow: "0 4px 20px rgba(255,92,0,0.3)" }}
              onClick={() => navigate("checkout")}
            >
              Tiến hành thanh toán →
            </button>

            <button
              className="btn-outline"
              style={{ width: "100%", padding: "12px 0", marginTop: 10, fontSize: 14 }}
              onClick={() => navigate("products")}
            >
              ← Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartPage;
