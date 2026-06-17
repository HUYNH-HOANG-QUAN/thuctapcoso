// =====================================================
// pages/HomePage.jsx – Trang chủ Premium
// Hero cinematic, sections animated, glass morphism
// =====================================================

import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import {
  CheckCircle,
  Truck,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { getProductUiData } from "../services/productService";
import { renderStars } from "../utils/productHelpers";

// Testimonials with real data
const testimonials = [
  {
    name: "Nguyễn Minh Tuấn",
    role: "Gym 3 năm",
    avatar: "🏋️",
    text: "Whey Gold Standard từ ProFit chất lượng không thua gì hàng xách tay nhưng giá tốt hơn nhiều. Giao hàng nhanh, đóng gói cẩn thận.",
    rating: 5,
    color: "var(--primary)",
  },
  {
    name: "Trần Thị Lan",
    role: "CrossFit Athlete",
    avatar: "💪",
    text: "Mình mua Creatine và Pre-Workout ở đây từ 1 năm nay. Nhân viên tư vấn nhiệt tình, hiểu biết. Sẽ tiếp tục ủng hộ!",
    rating: 5,
    color: "var(--purple)",
  },
  {
    name: "Lê Văn Hùng",
    role: "Personal Trainer",
    avatar: "🏃",
    text: "Là PT mình hay giới thiệu học viên mua ở đây. Hàng chính hãng 100%, giá cạnh tranh và nhiều chương trình ưu đãi hấp dẫn.",
    rating: 5,
    color: "var(--blue)",
  },
];

const stats = [
  { number: "500+", label: "Sản phẩm", icon: "🛍️" },
  { number: "20K+", label: "Khách hàng", icon: "👥" },
  { number: "50+", label: "Thương hiệu", icon: "🏆" },
  { number: "100%", label: "Chính hãng", icon: "✓" },
];

const HomePage = ({ navigate, onAddToCart, onViewDetail }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const { products, categories } = await getProductUiData(200);
        if (!isMounted) return;
        setFeaturedProducts(products.slice(0, 8));
        setMainCategories(categories.filter((c) => c.id !== 0));
        setTimeout(() => setLoaded(true), 100);
      } catch (error) {
        console.error("Không thể tải dữ liệu trang chủ:", error);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const cardStyle = (delay) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(30px)",
    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
  });

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="hero">
        {/* Floating particles decoration */}
        <div style={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,92,0,0.08) 0%, transparent 70%)",
          animation: "heroFloat 4s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        <div className="hero-text">
          {/* Animated badge */}
          <div className="hero-badge">
            <span style={{ fontSize: 16 }}>⚡</span>
            Chính hãng 100% — Nhập khẩu trực tiếp
          </div>

          {/* Title */}
          <h1 className="hero-title">
            NÂNG CẤP
            <br />
            CƠ THỂ
            <br />
            <span>CỦA BẠN</span>
          </h1>

          <p className="hero-desc">
            Cung cấp thực phẩm bổ sung chính hãng: Whey Protein,
            Creatine, Pre-Workout và hơn thế nữa.
            <strong style={{ color: "var(--primary)" }}> Hiệu quả thật — giá cả thật.</strong>
          </p>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              style={{ padding: "16px 36px", fontSize: 16 }}
              onClick={() => navigate("products")}
            >
              🛍️ Mua ngay
            </button>
            <button
              className="btn-outline"
              style={{ padding: "16px 36px", fontSize: 16 }}
              onClick={() => navigate("products")}
            >
              Khám phá ngay
            </button>
          </div>

          {/* Trust badges */}
          <div style={{
            display: "flex",
            gap: 24,
            marginTop: 36,
            flexWrap: "wrap",
          }}>
            {[
              { icon: "🔒", text: "Thanh toán an toàn" },
              { icon: "🚚", text: "Giao hàng nhanh" },
              { icon: "✓", text: "Cam kết chính hãng" },
            ].map((b) => (
              <div key={b.text} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--gray)",
                fontWeight: 600,
              }}>
                <span style={{ fontSize: 18 }}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
            alt="Fitness Athlete"
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "520px",
              borderRadius: "var(--radius-xl)",
              objectFit: "cover",
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
            }}
          />
          {/* Floating badge */}
          <div style={{
            position: "absolute",
            bottom: 20,
            left: -20,
            background: "rgba(21, 28, 44, 0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,92,0,0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: "heroFloat 3s ease-in-out infinite",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            <span style={{ fontSize: 28 }}>💪</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--white)" }}>Giao hàng</div>
              <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>Miễn phí ≥500K</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <div className="stats">
        {stats.map((s, i) => (
          <div className="stat-item" key={s.label} style={cardStyle(i * 100)}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ===== DANH MỤC ===== */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">DANH MỤC <span>NỔI BẬT</span></h2>
            <p className="section-subtitle">Chọn danh mục phù hợp với mục tiêu của bạn</p>
          </div>
          <span className="see-all" onClick={() => navigate("products")}>
            Xem tất cả →
          </span>
        </div>
        <div className="category-grid" style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s" }}>
          {mainCategories.slice(0, 4).map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isActive={false}
              onClick={() => navigate("products", { categoryId: cat.id })}
            />
          ))}
        </div>
      </section>

      {/* ===== SẢN PHẨM BÁN CHẠY ===== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">SẢN PHẨM <span>BÁN CHẠY</span></h2>
            <p className="section-subtitle">Top sản phẩm được khách hàng tin dùng nhất</p>
          </div>
          <span className="see-all" onClick={() => navigate("products")}>
            Xem tất cả →
          </span>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product, i) => (
            <div key={product.id} style={cardStyle(i * 80)}>
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onViewDetail={onViewDetail}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="promo-banner" style={{ margin: "0 60px" }}>
          <div className="promo-text">
            <h2>SALE UP TO 30%</h2>
            <p>Ưu đãi khủng cho tất cả sản phẩm Whey Protein và Pre-Workout. Chỉ áp dụng trong tháng này!</p>
          </div>
          <button className="btn-white" onClick={() => navigate("products")}>
            Mua ngay →
          </button>
        </div>
      </section>

      {/* ===== TẠI SAO CHỌN CHÚNG TÔI ===== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">TẠI SAO CHỌN <span>CHÚNG TÔI?</span></h2>
            <p className="section-subtitle">Cam kết về chất lượng và dịch vụ</p>
          </div>
        </div>
        <div className="features-grid">
          {[
            {
              icon: <CheckCircle size={40} color="var(--primary)" />,
              title: "Chính hãng 100%",
              desc: "Nhập khẩu trực tiếp từ nhà sản xuất, có tem chống hàng giả & giấy kiểm định.",
            },
            {
              icon: <Truck size={40} color="var(--primary)" />,
              title: "Giao hàng nhanh",
              desc: "Giao trong 2–4 giờ tại TP.HCM, 1–2 ngày toàn quốc. Miễn phí đơn ≥500K.",
            },
            {
              icon: <RefreshCw size={40} color="var(--primary)" />,
              title: "Đổi trả dễ dàng",
              desc: "Đổi trả miễn phí trong 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất.",
            },
            {
              icon: <MessageCircle size={40} color="var(--primary)" />,
              title: "Tư vấn miễn phí",
              desc: "Chuyên gia dinh dưỡng tư vấn lộ trình phù hợp với mục tiêu tập luyện của bạn.",
            },
          ].map((f, i) => (
            <div className="feature-card" key={f.title} style={cardStyle(i * 100)}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">KHÁCH HÀNG <span>NÓI GÌ?</span></h2>
            <p className="section-subtitle">Hơn 20,000 khách hàng đã tin tưởng ProFit</p>
          </div>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={t.name} style={cardStyle(i * 120)}>
              <div className="testimonial-header">
                <div
                  className="testimonial-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}22, ${t.color}11)`,
                    border: `2px solid ${t.color}33`,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
              <div style={{ color: "#f59e0b", marginBottom: 12 }}>
                {"★".repeat(t.rating)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(255,92,0,0.08), rgba(139,92,246,0.06))",
          borderRadius: "var(--radius-xl)",
          padding: "64px",
          textAlign: "center",
          border: "1px solid rgba(255,92,0,0.1)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative glow */}
          <div style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,92,0,0.08) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 56,
            color: "var(--white)",
            letterSpacing: 3,
            marginBottom: 16,
            position: "relative",
            zIndex: 1,
          }}>
            SẴN SÀNG <span style={{ color: "var(--primary)" }}>BẮT ĐẦU?</span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "var(--gray)",
            marginBottom: 36,
            maxWidth: 480,
            margin: "0 auto 36px",
            position: "relative",
            zIndex: 1,
          }}>
            Khám phá hơn 500 sản phẩm chính hãng và bắt đầu hành trình
            chinh phục cơ thể của bạn ngay hôm nay.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", position: "relative", zIndex: 1 }}>
            <button className="btn-primary" style={{ padding: "16px 40px", fontSize: 16 }} onClick={() => navigate("products")}>
              🛍️ Mua sắm ngay
            </button>
            <button className="btn-outline" style={{ padding: "16px 40px", fontSize: 16 }} onClick={() => navigate("about")}>
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
