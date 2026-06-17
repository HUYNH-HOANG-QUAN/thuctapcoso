// =====================================================
// pages/OrderDetailPage.jsx – Chi tiết một đơn hàng
// Props: order, navigate
// =====================================================

import { formatPrice } from "../utils/productHelpers";
import { transformOrderFromBE } from "../utils/orderHelpers";

// Nhãn trạng thái đơn hàng - phản ánh hành động của admin
const STATUS_CONFIG = {
  PENDING:           { label: "Chờ xác nhận",              color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "#f59e0b" },
  PENDING_CONFIRM:   { label: "Chờ thanh toán",            color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "#3b82f6" },
  CONFIRMED:         { label: "Admin đã xác nhận đơn hàng", color: "var(--blue)", bg: "rgba(59,130,246,0.1)", border: "var(--blue)" },
  DELIVERED:         { label: "Đã nhận hàng",              color: "var(--green)", bg: "rgba(34,197,94,0.1)", border: "var(--green)" },
  COMPLETED:         { label: "Hoàn thành",                 color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "#10b981" },
  CANCELLED:         { label: "Admin đã hủy đơn",          color: "var(--red)", bg: "rgba(239,68,68,0.1)", border: "var(--red)" },
  DELIVERED_FAILED:  { label: "Giao hàng thất bại",        color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "#ef4444" },
};

const OrderDetailPage = ({ order, navigate, onAddToCart }) => {
  // If order is a raw BE response (no info, no subtotal), transform it
  const safeOrder = order && !order.info && !order.subtotal
    ? transformOrderFromBE(order)
    : order;

  if (!safeOrder) {
    return (
      <div className="section">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Không tìm thấy đơn hàng</h3>
          <button className="btn-primary" onClick={() => navigate("orders")}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const statusKey =
    safeOrder.paymentStatus?.toUpperCase() === "PENDING_CONFIRM" ? "PENDING_CONFIRM"
    : safeOrder.status?.toUpperCase();

  const st = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
  const isCancelled = safeOrder.status?.toUpperCase() === "CANCELLED" || safeOrder.status?.toUpperCase() === "DELIVERED_FAILED";

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate("home")}>Trang chủ</span>
        <span> / </span>
        <span onClick={() => navigate("orders")}>Đơn hàng</span>
        <span> / </span>
        <span style={{ color: "var(--primary)" }}>#{safeOrder.id}</span>
      </div>

      <section className="section">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}
        >
          {/* Cột trái */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Trạng thái đơn hàng - hiển thị đơn giản */}
            <div
              style={{
                background: st.bg,
                border: `1px solid ${st.border}`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: st.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}>
                  {isCancelled ? "✕" : "✓"}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: 12,
                    color: "var(--gray)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    marginBottom: 4,
                  }}>
                    Trạng thái đơn hàng
                  </div>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 28,
                    color: st.color,
                    letterSpacing: 1,
                  }}>
                    {st.label}
                  </div>
                  {safeOrder.paymentStatus?.toUpperCase() === "PENDING_CONFIRM" && (
                    <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 4 }}>
                      Bạn đã báo thanh toán. Đơn đang được admin kiểm tra và xác nhận.
                    </div>
                  )}
                  {safeOrder.status?.toUpperCase() === "CONFIRMED" && (
                    <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 4 }}>
                      Đơn hàng đã được admin xác nhận và đang được chuẩn bị.
                    </div>
                  )}
                  {safeOrder.status?.toUpperCase() === "DELIVERED" && (
                    <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 4 }}>
                      Đơn hàng đã được giao thành công.
                    </div>
                  )}
                  {safeOrder.status?.toUpperCase() === "COMPLETED" && (
                    <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 4 }}>
                      Đơn hàng đã hoàn thành. Cảm ơn bạn đã mua sắm tại ProFit!
                    </div>
                  )}
                  {safeOrder.status?.toUpperCase() === "CANCELLED" && (
                    <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 4 }}>
                      Đơn hàng đã bị hủy bởi quản trị viên.
                    </div>
                  )}
                  {safeOrder.status?.toUpperCase() === "DELIVERED_FAILED" && (
                    <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 4 }}>
                      Giao hàng không thành công. Vui lòng liên hệ support để được hỗ trợ.
                    </div>
                  )}
                  {safeOrder.status?.toUpperCase() === "PENDING" && (
                    <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 4 }}>
                      Đang chờ admin xác nhận đơn hàng...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sản phẩm trong đơn */}
            <div
              style={{
                background: "var(--card-bg)",
                borderRadius: 16,
                padding: 28,
                border: "1px solid #2a2a2a",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 22,
                  marginBottom: 20,
                  letterSpacing: 1,
                }}
              >
                SẢN PHẨM ĐÃ ĐẶT
              </h3>
              {safeOrder.items.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom: "1px solid #2a2a2a",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 52,
                      background: "var(--dark3)",
                      borderRadius: 12,
                      padding: "8px 12px",
                    }}
                  >
                    {item.product.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--white)",
                        marginBottom: 4,
                      }}
                    >
                      {item.product.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--primary)",
                        fontWeight: 700,
                      }}
                    >
                      {item.product.brand}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--gray)",
                        marginTop: 4,
                      }}
                    >
                      {formatPrice(item.product.price)} × {item.quantity}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 22,
                      color: "var(--primary)",
                    }}
                  >
                    {formatPrice(item.product.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Thông tin giao hàng */}
            {(safeOrder.info || safeOrder.recipientName) && (
              <div
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  padding: 28,
                  border: "1px solid #2a2a2a",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 22,
                    marginBottom: 20,
                    letterSpacing: 1,
                  }}
                >
                  THÔNG TIN GIAO HÀNG
                </h3>
                {[
                  ["👤 Người nhận", safeOrder.recipientName || safeOrder.info?.fullName],
                  ["📞 Số điện thoại", safeOrder.recipientPhone || safeOrder.info?.phone],
                  [
                    "📍 Địa chỉ",
                    safeOrder.shippingAddress
                      ? `${safeOrder.shippingAddress}${safeOrder.province ? ", " + safeOrder.province : ""}`
                      : safeOrder.info?.address
                        ? `${safeOrder.info.address}, ${safeOrder.info.district || ""}, ${safeOrder.info.city || ""}`
                        : null,
                  ],
                  [
                    "💳 Thanh toán",
                    safeOrder.payMethod === "vnpay"
                      ? "Thanh toán qua VNPAY"
                      : safeOrder.payMethod === "banking"
                        ? "Chuyển khoản ngân hàng"
                        : "Thanh toán khi nhận hàng",
                  ],
                ].map(
                  ([label, value]) =>
                    value && (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          gap: 16,
                          marginBottom: 12,
                          fontSize: 14,
                        }}
                      >
                        <span style={{ color: "var(--gray)", minWidth: 140 }}>
                          {label}
                        </span>
                        <span
                          style={{ color: "var(--white)", fontWeight: 600 }}
                        >
                          {value}
                        </span>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>

          {/* Cột phải: Tổng kết */}
          <div className="cart-summary" style={{ position: "sticky", top: 90 }}>
            <h3 className="summary-title">TÓM TẮT ĐƠN #{safeOrder.id}</h3>
            <div
              style={{ fontSize: 13, color: "var(--gray)", marginBottom: 20 }}
            >
              Ngày đặt: {safeOrder.createdAt}
            </div>

            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(safeOrder.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span
                style={{
                  color: safeOrder.shipping === 0 ? "var(--green)" : "inherit",
                }}
              >
                {safeOrder.shipping === 0
                  ? "Miễn phí"
                  : formatPrice(safeOrder.shipping)}
              </span>
            </div>
            {safeOrder.discount > 0 && (
              <div className="summary-row">
                <span>Giảm giá</span>
                <span style={{ color: "var(--green)" }}>
                  - {formatPrice(safeOrder.discount)}
                </span>
              </div>
            )}
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(safeOrder.total)}</span>
            </div>

            <button
              className="btn-outline"
              style={{ width: "100%", padding: "12px 0", marginTop: 20 }}
              onClick={() => navigate("orders")}
            >
              ← Về danh sách đơn
            </button>
            {safeOrder.status?.toUpperCase() === "CONFIRMED" && onAddToCart && (
              <button
                className="btn-primary"
                style={{ width: "100%", padding: "12px 0", marginTop: 10 }}
                onClick={() => {
                  safeOrder.items.forEach((item) => {
                    if (item.product && item.product.id) {
                      onAddToCart(item.product);
                    }
                  });
                  navigate("cart");
                }}
              >
                Mua lại
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderDetailPage;
