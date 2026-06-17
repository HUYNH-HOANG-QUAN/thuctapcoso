// =====================================================
// pages/OrderPage.jsx – Lịch sử đơn hàng của người dùng
// =====================================================

import { useState, useEffect } from "react";
import { formatPrice } from "../utils/productHelpers";
import { transformOrderFromBE } from "../utils/orderHelpers";
import { Package, Inbox, RefreshCw, Loader2 } from "lucide-react";
import { apiGetMyOrders, apiCancelOrder, isLoggedIn } from "../utils/api";

const STATUS_LABEL = {
  PENDING:            { text: "Chờ xác nhận",             color: "#f59e0b" },
  CONFIRMED:          { text: "Admin đã xác nhận đơn hàng", color: "var(--blue)" },
  DELIVERED:          { text: "Đã nhận hàng",             color: "var(--green)" },
  COMPLETED:          { text: "Hoàn thành",                color: "#10b981" },
  CANCELLED:          { text: "Admin đã hủy đơn",         color: "var(--red)" },
  DELIVERED_FAILED:   { text: "Giao hàng thất bại",       color: "#ef4444" },
  PENDING_CONFIRM:    { text: "Chờ thanh toán",           color: "#3b82f6" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const OrderPage = ({ navigate, onViewOrderDetail, user, showToast }) => {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [localOrders, setLocalOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    const savedLocal = localStorage.getItem("localOrders");
    if (savedLocal) {
      try { setLocalOrders(JSON.parse(savedLocal)); } catch { setLocalOrders([]); }
    }

    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const beOrders = await apiGetMyOrders();
      setOrders((beOrders || []).map(transformOrderFromBE));
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Tu dong refetch khi user quay lai tab (focus) hoac khi orders trong App thay doi
  useEffect(() => {
    const handleFocus = () => fetchOrders();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancellingId(orderId);
    try {
      await apiCancelOrder(orderId);
      if (showToast) showToast("Đã hủy đơn hàng thành công");
      fetchOrders();
    } catch (err) {
      console.error("Lỗi hủy đơn:", err);
      if (showToast) showToast(`Không thể hủy đơn: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  // Kết hợp orders từ BE và local
  const allOrders = [
    ...orders,
    ...localOrders.filter(
      (lo) => !orders.some((ro) => ro.orderCode === lo.orderCode),
    ),
  ];

  const sortedOrders = [...allOrders].sort((a, b) => {
    const dateA = new Date(a.placedAt || a.createdAt);
    const dateB = new Date(b.placedAt || b.createdAt);
    return dateB - dateA;
  });

  const filtered = sortedOrders.filter((o) => {
    // Filter theo trạng thái
    let matchFilter = filter === "ALL";
    if (!matchFilter) {
      if (filter === "PENDING_CONFIRM") {
        matchFilter = o.paymentStatus === "PENDING_CONFIRM";
      } else {
        matchFilter = o.status === filter;
      }
    }
    // Filter theo search
    const q = search.toLowerCase();
    const matchSearch = !q
      || (o.orderCode || "").toLowerCase().includes(q)
      || (o.recipientName || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="section">
        <div className="page-hero">
          <h1>LỊCH SỬ <span>ĐƠN HÀNG</span></h1>
        </div>
        <div className="empty-state">
          <Loader2 size={48} color="var(--primary)" className="spinning" />
          <h3>Đang tải đơn hàng...</h3>
        </div>
      </div>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <div className="section">
        <div className="page-hero">
          <h1>LỊCH SỬ <span>ĐƠN HÀNG</span></h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">
            <Package size={64} color="var(--primary)" />
          </div>
          <h3>Chưa có đơn hàng nào</h3>
          <p>
            {isLoggedIn()
              ? "Hãy mua sắm và theo dõi đơn hàng của bạn tại đây."
              : "Đăng nhập để xem đơn hàng của bạn."}
          </p>
          <button className="btn-primary" onClick={() => navigate("products")}>
            Mua sắm ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-hero">
        <h1>LỊCH SỬ <span>ĐƠN HÀNG</span></h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
          <p style={{ margin: 0 }}>{sortedOrders.length} đơn hàng</p>
          <button
            onClick={fetchOrders}
            style={{
              background: "var(--dark3)", color: "var(--white)", border: "1px solid var(--dark4)",
              padding: "6px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
            title="Làm mới danh sách đơn hàng từ server"
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      <section className="section">
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--red)",
            borderRadius: 8, padding: "12px 16px",
            marginBottom: 20, display: "flex", alignItems: "center", gap: 12, color: "var(--red)",
          }}>
            <RefreshCw size={18} />
            <span>{error} - Hiển thị đơn hàng đã lưu cục bộ.</span>
            <button onClick={fetchOrders}
              style={{ marginLeft: "auto", background: "var(--red)", color: "white", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
              Thử lại
            </button>
          </div>
        )}

        {/* Filter tabs — dùng UPPERCASE keys để khớp với transformOrderFromBE */}
        <div className="order-tabs">
          {[
            { key: "ALL",               label: "Tất cả" },
            { key: "PENDING",           label: "Chờ xác nhận" },
            { key: "PENDING_CONFIRM",   label: "Chờ thanh toán" },
            { key: "CONFIRMED",         label: "Admin xác nhận" },
            { key: "DELIVERED",         label: "Đã nhận hàng" },
            { key: "COMPLETED",         label: "Hoàn thành" },
            { key: "CANCELLED",         label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`order-tab ${filter === tab.key ? "active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginTop: 12, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên người nhận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 16px",
              background: "var(--card-bg)", color: "var(--white)",
              border: "1px solid var(--dark4)", borderRadius: 10,
              fontSize: 14,
            }}
          />
        </div>

        {/* Danh sách đơn */}
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 0" }}>
            <div className="empty-icon">
              <Inbox size={64} color="var(--gray)" />
            </div>
            <h3>Không có đơn hàng nào</h3>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
            {filtered.map((order) => {
              const displayStatus = order.paymentStatus === "PENDING_CONFIRM"
                ? "PENDING_CONFIRM"
                : order.status;
              const st = STATUS_LABEL[displayStatus] ?? STATUS_LABEL.PENDING;
              const canCancel = order.id && (
                order.status === "PENDING" || order.paymentStatus === "PENDING_CONFIRM"
              );

              return (
                <div key={order.orderCode || order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <span style={{ fontSize: 13, color: "var(--gray)" }}>Mã đơn: </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--white)" }}>
                        {order.orderCode || `#${order.id}`}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--gray)" }}>
                      {formatDate(order.placedAt || order.createdAt)}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: st.color,
                      padding: "4px 12px", borderRadius: 6,
                      border: `1px solid ${st.color}`,
                    }}>
                      {st.text}
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={item.id || item.productId || idx}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 0",
                          borderBottom: idx < Math.min(order.items.length, 3) - 1 ? "1px solid #2a2a2a" : "none",
                        }}>
                        <span style={{ fontSize: 36 }}>
                          {item.product?.emoji || "🏋️"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--white)" }}>
                            {item.productName || item.product?.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--gray)" }}>x{item.quantity}</div>
                        </div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "var(--primary)" }}>
                          {formatPrice(item.lineTotal)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div style={{ fontSize: 13, color: "var(--gray)", padding: "8px 0" }}>
                        +{order.items.length - 3} sản phẩm khác
                      </div>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div>
                      <span style={{ fontSize: 14, color: "var(--gray)" }}>Tổng: </span>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "var(--primary)" }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      {canCancel && (
                        <button className="btn-danger"
                          style={{ padding: "8px 16px", fontSize: 13 }}
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}>
                          {cancellingId === order.id ? "Đang hủy..." : "Hủy đơn"}
                        </button>
                      )}
                      <button className="btn-primary"
                        style={{ padding: "8px 20px", fontSize: 13 }}
                        onClick={() => onViewOrderDetail(order)}>
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderPage;
