// =====================================================
// components/Footer.jsx – Footer Premium
// =====================================================

const Footer = ({ navigate }) => {
  return (
    <footer>
      <div className="footer-top">
        {/* Cột 1: Thương hiệu */}
        <div className="footer-brand">
          <span
            className="logo"
            onClick={() => navigate("home")}
            style={{ cursor: "pointer" }}
          >
            Pro<span>Fit</span>
          </span>
          <p>
            Cung cấp thực phẩm bổ sung chính hãng, uy tín hàng đầu Việt Nam.
            Đồng hành cùng hành trình chinh phục cơ thể của bạn.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {["📘", "📸", "▶️", "💬"].map((icon, i) => (
              <div key={i} className="social-btn">{icon}</div>
            ))}
          </div>
        </div>

        {/* Cột 2: Sản phẩm */}
        <div className="footer-col">
          <h4>Sản phẩm</h4>
          <ul>
            <li><button onClick={() => navigate("products")}>Whey Protein</button></li>
            <li><button onClick={() => navigate("products")}>Creatine</button></li>
            <li><button onClick={() => navigate("products")}>Pre-Workout</button></li>
            <li><button onClick={() => navigate("products")}>Vitamin & BCAA</button></li>
            <li><button onClick={() => navigate("products")}>Mass Gainer</button></li>
          </ul>
        </div>

        {/* Cột 3: Thông tin */}
        <div className="footer-col">
          <h4>Thông tin</h4>
          <ul>
            <li><button onClick={() => navigate("about")}>Về chúng tôi</button></li>
            <li><button onClick={() => navigate("contact")}>Blog & Kiến thức</button></li>
            <li><button onClick={() => navigate("contact")}>Chính sách đổi trả</button></li>
            <li><button onClick={() => navigate("contact")}>Chính sách bảo mật</button></li>
            <li><button onClick={() => navigate("contact")}>Điều khoản sử dụng</button></li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div className="footer-col">
          <h4>Liên hệ</h4>
          <ul>
            <li><button>📍 123 Nguyễn Trãi, Q.1, TP.HCM</button></li>
            <li><button>📞 0901 234 567</button></li>
            <li><button>✉️ hello@profit.vn</button></li>
            <li><button>⏰ 8:00 — 22:00 mỗi ngày</button></li>
          </ul>
        </div>
      </div>

      {/* Dòng cuối */}
      <div className="footer-bottom">
        <p>© 2024 ProFit. Tất cả quyền được bảo lưu.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--gray-dark)" }}>Thanh toán:</span>
          {["💳", "🏦", "📱", "💵"].map((icon, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 16,
            }}>
              {icon}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
