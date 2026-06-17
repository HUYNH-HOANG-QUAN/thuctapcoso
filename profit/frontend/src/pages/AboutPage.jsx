// =====================================================
// pages/AboutPage.jsx – Giới thiệu Premium
// =====================================================

import { Target, Lightbulb, Handshake, Leaf } from "lucide-react";

const AboutPage = ({ navigate }) => {
  return (
    <div>
      {/* Tiêu đề */}
      <div className="page-hero">
        <h1>VỀ <span>CHÚNG TÔI</span></h1>
        <p>Hành trình xây dựng cộng đồng thể thao khỏe mạnh tại Việt Nam</p>
      </div>

      {/* ===== GIỚI THIỆU ===== */}
      <section className="section">
        <div className="about-layout">
          <div>
            <div style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 11,
              color: "var(--primary)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "3px",
              marginBottom: 16,
            }}>
              Câu chuyện của chúng tôi
            </div>
            <h2 className="section-title" style={{ fontSize: 44, marginBottom: 24 }}>
              NƠI <span>TINH THẦN</span><br />ĐƯỢC NUÔI DƯỠNG
            </h2>
            <p style={{ color: "var(--gray)", fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
              ProFit được thành lập vào năm 2019 bởi những người yêu thể thao với mục tiêu
              mang đến thực phẩm bổ sung chính hãng, chất lượng cao với giá hợp lý cho cộng đồng
              thể thao Việt Nam.
            </p>
            <p style={{ color: "var(--gray)", fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
              Chúng tôi hiểu rõ nỗi lo của người tập về hàng giả, hàng kém chất lượng. Vì vậy,
              100% sản phẩm tại ProFit được nhập khẩu trực tiếp và có đầy đủ giấy tờ kiểm định.
            </p>
            <p style={{ color: "var(--gray)", fontSize: 16, lineHeight: 1.8 }}>
              Sau 5 năm hoạt động, chúng tôi tự hào phục vụ hơn 20,000 khách hàng và trở thành
              nhà phân phối uy tín của hơn 50 thương hiệu hàng đầu thế giới tại Việt Nam.
            </p>

            <div style={{ marginTop: 36, display: "flex", gap: 16 }}>
              <button className="btn-primary" onClick={() => navigate("products")}>
                🛍️ Khám phá sản phẩm
              </button>
              <button className="btn-outline" onClick={() => navigate("contact")}>
                Liên hệ ngay
              </button>
            </div>
          </div>

          {/* Image collage */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 16 }}>
            <div style={{
              gridColumn: "1 / -1",
              background: "linear-gradient(135deg, rgba(255,92,0,0.08), rgba(139,92,246,0.06))",
              borderRadius: "var(--radius-xl)",
              height: 200,
              border: "1px solid rgba(255,92,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
            }}>
              🏋️
            </div>
            <div style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.06))",
              borderRadius: "var(--radius-xl)",
              height: 160,
              border: "1px solid rgba(139,92,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
            }}>
              💪
            </div>
            <div style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,92,0,0.04))",
              borderRadius: "var(--radius-xl)",
              height: 160,
              border: "1px solid rgba(34,197,94,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
            }}>
              🏆
            </div>
          </div>
        </div>
      </section>

      {/* ===== THỐNG KÊ ===== */}
      <div className="stats">
        {[
          { number: "2019", label: "Năm thành lập", icon: "📅" },
          { number: "500+", label: "Sản phẩm", icon: "🛍️" },
          { number: "20K+", label: "Khách hàng", icon: "👥" },
          { number: "50+", label: "Thương hiệu", icon: "🏆" },
        ].map((s) => (
          <div className="stat-item" key={s.label}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ===== GIÁ TRỊ CỐT LÕI ===== */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">GIÁ TRỊ <span>CỐT LÕI</span></h2>
            <p className="section-subtitle">Những nguyên tắc định hướng mọi quyết định của chúng tôi</p>
          </div>
        </div>
        <div className="values-grid">
          {[
            { icon: <Target size={40} color="var(--primary)" />, title: "Chính trực", desc: "Luôn trung thực với khách hàng về nguồn gốc, thành phần và hiệu quả của sản phẩm." },
            { icon: <Lightbulb size={40} color="var(--primary)" />, title: "Kiến thức", desc: "Đội ngũ chuyên gia luôn cập nhật kiến thức mới nhất về dinh dưỡng thể thao." },
            { icon: <Handshake size={40} color="var(--primary)" />, title: "Đồng hành", desc: "Không chỉ bán sản phẩm, chúng tôi đồng hành cùng bạn trên hành trình chinh phục mục tiêu." },
            { icon: <Leaf size={40} color="var(--primary)" />, title: "Bền vững", desc: "Ưu tiên sản phẩm thân thiện môi trường và đóng góp vào cộng đồng thể thao lành mạnh." },
          ].map((v) => (
            <div className="feature-card" key={v.title}>
              <div className="feature-icon">{v.icon}</div>
              <div className="feature-title">{v.title}</div>
              <div className="feature-desc">{v.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <div className="promo-banner" style={{ margin: "0 60px 70px" }}>
        <div className="promo-text">
          <h2>SẴN SÀNG<br />BẮT ĐẦU CHƯA?</h2>
          <p>Khám phá hơn 500 sản phẩm chính hãng và bắt đầu hành trình của bạn ngay hôm nay.</p>
        </div>
        <button className="btn-white" onClick={() => navigate("products")}>
          Khám phá ngay
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
