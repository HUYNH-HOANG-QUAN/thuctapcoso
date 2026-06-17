import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList
} from "recharts";
import { adminService } from "../../services/adminService";

const ORDER_STATUS_SUMMARY = [
  { key: "totalOrders", label: "Tổng đơn", icon: "📦", color: "var(--gray)" },
  { key: "pendingOrders", label: "Chờ xác nhận", icon: "⏳", color: "var(--amber)" },
  { key: "pendingConfirmOrders", label: "Chờ đối soát", icon: "💳", color: "var(--cyan)" },
  { key: "confirmedOrders", label: "Đã xác nhận", icon: "✅", color: "var(--blue)" },
  { key: "deliveredOrders", label: "Đã giao", icon: "🚚", color: "var(--purple)" },
  { key: "completedOrders", label: "Hoàn thành", icon: "🏁", color: "var(--green)" },
  { key: "cancelledOrders", label: "Đã hủy", icon: "❌", color: "var(--red)" },
];

const formatPrice = (price) => {
  if (!price) return "0 ₫";
  if (price >= 1000000000) return (price / 1000000000).toFixed(1) + " tỷ ₫";
  if (price >= 1000000) return (price / 1000000).toFixed(1) + " triệu ₫";
  if (price >= 1000) return (price / 1000).toFixed(0) + "K ₫";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatPriceFull = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(22, 36, 54, 0.95)",
        border: "1px solid var(--primary)",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)"
      }}>
        <p style={{ color: "var(--gray)", fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: "var(--primary)", fontSize: 16, fontWeight: 700 }}>
          {formatPriceFull(payload[0]?.value)}
        </p>
        <p style={{ color: "var(--gray)", fontSize: 11, marginTop: 2 }}>
          {payload[0]?.payload?.orderCount || 0} đơn hàng
        </p>
      </div>
    );
  }
  return null;
};

const ProductTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(22, 36, 54, 0.95)",
        border: "1px solid var(--green)",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)"
      }}>
        <p style={{ color: "var(--green)", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          {payload[0]?.payload?.productName}
        </p>
        <p style={{ color: "var(--gray)", fontSize: 11, marginBottom: 2 }}>
          Đã bán: <span style={{ color: "var(--amber)", fontWeight: 700 }}>{payload[0]?.payload?.totalSold}</span> sản phẩm
        </p>
        <p style={{ color: "var(--gray)", fontSize: 11 }}>
          Doanh thu: <span style={{ color: "var(--primary)", fontWeight: 700 }}>{formatPriceFull(payload[0]?.payload?.totalRevenue)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DashboardPage = ({ navigate }) => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("day"); // day | month | year
  const [pendingConfirmCount, setPendingConfirmCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAllOrders(),
        ]);
        setStats(statsData);
        setOrders(ordersData);

        const pendingPayment = ordersData.filter(o => o.paymentStatus === "PENDING_CONFIRM").length;
        const pendingOrder = ordersData.filter(o => o.status === "PENDING").length;
        setPendingConfirmCount(pendingPayment);
        setPendingOrderCount(pendingOrder);
      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Chart data based on active tab
  const chartData = activeTab === "day"
    ? (stats?.revenueByDay || [])
    : activeTab === "month"
      ? (stats?.revenueByMonth || [])
      : (stats?.revenueByYear || []);

  const maxRevenue = chartData.length > 0
    ? Math.max(...chartData.map(d => Number(d.revenue) || 0))
    : 0;

  // Recent orders with priority sorting
  const recentOrders = [...orders].sort((a, b) => {
    if (a.paymentStatus === "PENDING_CONFIRM" && b.paymentStatus !== "PENDING_CONFIRM") return -1;
    if (a.paymentStatus !== "PENDING_CONFIRM" && b.paymentStatus === "PENDING_CONFIRM") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  }).slice(0, 6);

  const STATUS_LABEL = {
    PENDING:           { text: "Chờ xác nhận",  color: "var(--amber)" },
    CONFIRMED:         { text: "Đã xác nhận",    color: "var(--blue)" },
    DELIVERED:         { text: "Đã giao hàng",   color: "var(--purple)" },
    COMPLETED:         { text: "Hoàn thành",     color: "var(--green)" },
    CANCELLED:         { text: "Đã hủy",         color: "var(--red)" },
    PENDING_CONFIRM:   { text: "Chờ thanh toán", color: "var(--cyan)" },
  };

  if (loading) {
    return (
      <div className="section" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, border: "4px solid var(--dark4)",
            borderTopColor: "var(--primary)", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ color: "var(--gray)", fontSize: 14 }}>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Alert Banners */}
      {pendingConfirmCount > 0 && (
        <div style={{
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: 12, padding: "14px 20px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
        }}
          onClick={() => navigate("admin-orders")}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26 }}>💳</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--blue)", fontSize: 15 }}>Yêu cầu xác nhận thanh toán</div>
              <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 2 }}>
                Có <strong style={{ color: "var(--blue)" }}>{pendingConfirmCount}</strong> đơn hàng chờ xác nhận
              </div>
            </div>
          </div>
          <span style={{ color: "var(--blue)", fontWeight: 700, fontSize: 14 }}>Xem ngay →</span>
        </div>
      )}

      {pendingOrderCount > 0 && (
        <div style={{
          background: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: 12, padding: "14px 20px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
        }}
          onClick={() => navigate("admin-orders")}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.3)"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26 }}>📦</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--amber)", fontSize: 15 }}>Yêu cầu xác nhận đơn hàng</div>
              <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 2 }}>
                Có <strong style={{ color: "var(--amber)" }}>{pendingOrderCount}</strong> đơn hàng COD chờ xác nhận
              </div>
            </div>
          </div>
          <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: 14 }}>Xem ngay →</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2, margin: 0 }}>
          BẢNG ĐIỀU KHIỂN <span style={{ color: "var(--primary)" }}>QUẢN TRỊ</span>
        </h2>
        <div style={{ fontSize: 12, color: "var(--gray)" }}>
          Cập nhật: {new Date().toLocaleString("vi-VN")}
        </div>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
        {/* Tổng doanh thu */}
        <div style={{
          background: "var(--card-bg)", borderRadius: 18,
          padding: "22px 24px", border: "1px solid var(--dark4)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20, width: 80, height: 80,
            background: "rgba(255, 92, 0, 0.08)", borderRadius: "50%"
          }} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 11, color: "var(--gray)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Tổng Doanh Thu</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "var(--primary)", lineHeight: 1 }}>
            {formatPrice(stats?.totalRevenue)}
          </div>
          <div style={{ fontSize: 11, color: "var(--green)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            ✓ Đơn hoàn thành
          </div>
        </div>

        {/* Doanh thu tháng */}
        <div style={{
          background: "var(--card-bg)", borderRadius: 18,
          padding: "22px 24px", border: "1px solid var(--dark4)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20, width: 80, height: 80,
            background: "rgba(59, 130, 246, 0.08)", borderRadius: "50%"
          }} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
          <div style={{ fontSize: 11, color: "var(--gray)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Doanh Thu Tháng</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "var(--blue)", lineHeight: 1 }}>
            {formatPrice(stats?.monthRevenue)}
          </div>
          <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}>
            Tháng {new Date().getMonth() + 1} / {new Date().getFullYear()}
          </div>
        </div>

        {/* Doanh thu tuần */}
        <div style={{
          background: "var(--card-bg)", borderRadius: 18,
          padding: "22px 24px", border: "1px solid var(--dark4)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20, width: 80, height: 80,
            background: "rgba(16, 185, 129, 0.08)", borderRadius: "50%"
          }} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>📆</div>
          <div style={{ fontSize: 11, color: "var(--gray)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Doanh Thu Tuần</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "var(--green)", lineHeight: 1 }}>
            {formatPrice(stats?.todayRevenue)}
          </div>
          <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}>
            {(() => {
              const weekRevenue = (stats?.revenueByDay || []).slice(-7).reduce((s, d) => s + Number(d.revenue || 0), 0);
              return `7 ngày gần nhất: ${formatPrice(weekRevenue)}`;
            })()}
          </div>
        </div>

        {/* Doanh thu năm */}
        <div style={{
          background: "var(--card-bg)", borderRadius: 18,
          padding: "22px 24px", border: "1px solid var(--dark4)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20, width: 80, height: 80,
            background: "rgba(139, 92, 246, 0.08)", borderRadius: "50%"
          }} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 11, color: "var(--gray)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Doanh Thu Năm</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "var(--purple)", lineHeight: 1 }}>
            {formatPrice(stats?.yearRevenue)}
          </div>
          <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}>
            Năm {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, marginBottom: 28 }}>
        {/* Revenue Chart */}
        <div style={{
          background: "var(--card-bg)", borderRadius: 18,
          padding: "24px 28px", border: "1px solid var(--dark4)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, margin: 0 }}>
                BIỂU ĐỒ DOANH THU
              </h3>
              <p style={{ fontSize: 12, color: "var(--gray)", marginTop: 4 }}>
                Thống kê doanh thu theo đơn hàng hoàn thành
              </p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { key: "day", label: "30 Ngày" },
                { key: "month", label: "12 Tháng" },
                { key: "year", label: "5 Năm" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background: activeTab === tab.key
                      ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
                      : "var(--dark3)",
                    color: activeTab === tab.key ? "var(--white)" : "var(--gray)",
                    boxShadow: activeTab === tab.key ? "0 4px 12px rgba(255,92,0,0.3)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: 280, color: "var(--gray)"
            }}>
              <span style={{ fontSize: 48, opacity: 0.3 }}>📊</span>
              <p style={{ marginTop: 12, fontSize: 14 }}>Chưa có dữ liệu doanh thu</p>
              <p style={{ fontSize: 12, opacity: 0.6 }}>Doanh thu sẽ hiển thị khi có đơn hàng hoàn thành</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="barGradientMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="barGradientYear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dark4)" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: "var(--gray)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--dark4)" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatPrice(v)}
                  tick={{ fill: "var(--gray)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar
                  dataKey="revenue"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={activeTab === "year" ? 80 : activeTab === "month" ? 50 : 30}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={activeTab === "day" ? "url(#barGradient)" : activeTab === "month" ? "url(#barGradientMonth)" : "url(#barGradientYear)"}
                    />
                  ))}
                  {activeTab !== "day" && (
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(v) => v > 0 ? formatPrice(v) : ""}
                      style={{ fill: "var(--gray)", fontSize: 10 }}
                    />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Right Sidebar - Quick Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Secondary Stats */}
          <div style={{
            background: "var(--card-bg)", borderRadius: 18,
            padding: "20px 22px", border: "1px solid var(--dark4)"
          }}>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, margin: "0 0 16px", color: "var(--gray)" }}>
              TỔNG QUAN ĐƠN HÀNG
            </h4>
            {[
              { icon: "📦", label: "Tổng đơn hàng", value: stats?.totalOrders || 0, color: "var(--gray)" },
              { icon: "✅", label: "Hoàn thành", value: stats?.completedOrders || 0, color: "var(--green)" },
              { icon: "⏳", label: "Chờ xác nhận", value: stats?.pendingOrders || 0, color: "var(--amber)" },
              { icon: "📅", label: "Hôm nay", value: stats?.todayOrders || 0, color: "var(--blue)" },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid var(--dark3)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: "var(--gray)" }}>{item.label}</span>
                </div>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            background: "var(--card-bg)", borderRadius: 18,
            padding: "20px 22px", border: "1px solid var(--dark4)", marginBottom: 20
          }}>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, margin: "0 0 14px", color: "var(--gray)" }}>
              TÓM TẮT TRẠNG THÁI ĐƠN HÀNG
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              {ORDER_STATUS_SUMMARY.map((item) => (
                <div key={item.key} style={{
                  background: "var(--dark3)",
                  border: "1px solid var(--dark4)",
                  borderRadius: 12,
                  padding: "12px 14px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, color: "var(--gray)" }}>{item.label}</span>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: item.color }}>
                    {stats?.[item.key] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div style={{
            background: "var(--card-bg)", borderRadius: 18,
            padding: "20px 22px", border: "1px solid var(--dark4)", flex: 1
          }}>
            <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, margin: "0 0 14px", color: "var(--gray)" }}>
              TRUY CẬP NHANH
            </h4>
            {[
              { icon: "📦", label: "Quản lý sản phẩm", page: "admin-products", desc: "CRUD sản phẩm" },
              { icon: "📦", label: "Quản lý đơn hàng", page: "admin-orders", desc: "Xử lý đơn hàng" },
              { icon: "👥", label: "Quản lý User", page: "admin-users", desc: "Người dùng" },
            ].map(item => (
              <div key={item.label} onClick={() => navigate(item.page)}
                style={{
                  background: "var(--dark3)", borderRadius: 12, padding: "14px 16px",
                  border: "1px solid var(--dark4)", cursor: "pointer",
                  transition: "all 0.2s", marginBottom: 8, position: "relative"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--dark4)"; e.currentTarget.style.transform = "translateX(0)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--white)" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--gray)" }}>{item.desc}</div>
                  </div>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    position: "absolute", top: 10, right: 12,
                    background: "var(--primary)", color: "white",
                    fontSize: 10, fontWeight: 700,
                    padding: "2px 7px", borderRadius: 10,
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Best Selling Products + Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Best Selling Products Chart */}
        <div style={{
          background: "var(--card-bg)", borderRadius: 18,
          padding: "24px 28px", border: "1px solid var(--dark4)"
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, margin: "0 0 4px" }}>
              SẢN PHẨM BÁN CHẠY
            </h3>
            <p style={{ fontSize: 12, color: "var(--gray)" }}>
              Top sản phẩm được đặt nhiều nhất từ đơn hàng hoàn thành
            </p>
          </div>

          {!stats?.bestSellingProducts || stats.bestSellingProducts.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: 260, color: "var(--gray)"
            }}>
              <span style={{ fontSize: 48, opacity: 0.3 }}>🏷️</span>
              <p style={{ marginTop: 12, fontSize: 14 }}>Chưa có dữ liệu sản phẩm</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={stats.bestSellingProducts}
                margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dark4)" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => v}
                  tick={{ fill: "var(--gray)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--dark4)" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={120}
                  tick={{ fill: "var(--gray)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ProductTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="totalSold" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {stats.bestSellingProducts.map((entry, index) => {
                    const colors = ["#0ea5e9", "#06b6d4", "#3b82f6", "#8b5cf6", "#14b8a6", "#f59e0b", "#22c55e", "#ec4899", "#6366f1", "#a855f7"];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                  <LabelList
                    dataKey="totalSold"
                    position="right"
                    style={{ fill: "var(--gray)", fontSize: 11, fontWeight: 700 }}
                    formatter={(v) => `${v} sp`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{
          background: "var(--card-bg)", borderRadius: 18,
          padding: "24px 28px", border: "1px solid var(--dark4)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, margin: "0 0 4px" }}>
                ĐƠN HÀNG GẦN NHẤT
              </h3>
              <p style={{ fontSize: 12, color: "var(--gray)" }}>Ưu tiên đơn chờ thanh toán</p>
            </div>
            <span style={{ color: "var(--primary)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              onClick={() => navigate("admin-orders")}>Xem tất cả →</span>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: 260, color: "var(--gray)"
            }}>
              <span style={{ fontSize: 48, opacity: 0.3 }}>🛒</span>
              <p style={{ marginTop: 12, fontSize: 14 }}>Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
              {recentOrders.map(order => {
                const st = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING;
                const isPendingConfirm = order.paymentStatus === "PENDING_CONFIRM";
                return (
                  <div key={order.id}
                    onClick={() => navigate("admin-orders")}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 14px",
                      background: isPendingConfirm ? "rgba(6, 182, 212, 0.05)" : "var(--dark3)",
                      borderRadius: 10,
                      border: `1px solid ${isPendingConfirm ? "rgba(6, 182, 212, 0.2)" : "var(--dark4)"}`,
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = isPendingConfirm ? "rgba(6, 182, 212, 0.2)" : "var(--dark4)"}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: isPendingConfirm ? "var(--cyan)" : st.color,
                          border: `1px solid ${isPendingConfirm ? "var(--cyan)" : st.color}`,
                          padding: "2px 8px", borderRadius: 4
                        }}>
                          {isPendingConfirm ? "CHỜ TT" : st.text}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--white)" }}>
                          {order.orderCode}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--gray)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.recipientName || "—"} • {order.recipientPhone || ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "var(--primary)" }}>
                        {formatPriceFull(order.totalAmount)}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--gray)", marginTop: 2 }}>
                        {order.placedAt ? new Date(order.placedAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
