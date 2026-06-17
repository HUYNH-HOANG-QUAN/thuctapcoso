// =====================================================
// components/Navbar.jsx – Thanh điều hướng Premium
// Glass morphism, hover effects, gradient glow
// =====================================================

import { useState, useEffect } from "react";

const Navbar = ({ currentPage, navigate, cartCount, user, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Trang chủ", page: "home" },
    { label: "Sản phẩm", page: "products" },
    { label: "Về chúng tôi", page: "about" },
    { label: "Liên hệ", page: "contact" },
  ];

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: scrolled ? "12px 60px" : "16px 60px",
        background: scrolled
          ? "rgba(7, 9, 15, 0.92)"
          : "rgba(7, 9, 15, 0.8)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(255, 92, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: scrolled
          ? "0 4px 32px rgba(0,0,0,0.4), 0 0 40px rgba(255,92,0,0.04)"
          : "none",
      }}
    >
      {/* Logo */}
      <div
        className="logo"
        onClick={() => navigate("home")}
        style={{
          cursor: "pointer",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 34,
          letterSpacing: 3,
          color: "var(--primary)",
          textShadow: "0 0 20px rgba(255,92,0,0.35)",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textShadow = "0 0 35px rgba(255,92,0,0.6)";
          e.currentTarget.style.letterSpacing = "5px";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textShadow = "0 0 20px rgba(255,92,0,0.35)";
          e.currentTarget.style.letterSpacing = "3px";
        }}
      >
        Pro<span style={{ color: "var(--white)" }}>Fit</span>
      </div>

      {/* Desktop Menu */}
      <ul
        style={{
          display: "flex",
          gap: 4,
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
        className="nav-links"
      >
        {menuItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <li key={item.page}>
              <button
                type="button"
                onClick={() => navigate(item.page)}
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(255,92,0,0.15), rgba(255,92,0,0.05))"
                    : "transparent",
                  border: "none",
                  fontWeight: 700,
                  color: isActive ? "var(--primary)" : "rgba(255,255,255,0.65)",
                  fontSize: 15,
                  padding: "9px 20px",
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  fontFamily: "'Exo 2', sans-serif",
                  letterSpacing: "0.5px",
                  position: "relative",
                  boxShadow: isActive
                    ? "inset 0 0 20px rgba(255,92,0,0.08)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--white)";
                    e.currentTarget.style.background =
                      "rgba(255, 92, 0, 0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 20,
                      height: 2,
                      background: "var(--primary)",
                      borderRadius: 2,
                      boxShadow: "0 0 8px var(--primary-glow)",
                    }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bên phải */}
      <div className="nav-right">
        {/* Giỏ hàng — chỉ hiện khi đã đăng nhập và KHÔNG phải admin */}
        {user && user.role !== "admin" && (
          <button
            type="button"
            onClick={() => navigate("cart")}
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "var(--white)",
              border: "none",
              padding: "10px 22px",
              borderRadius: "50px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 4px 16px rgba(255, 92, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Exo 2', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(255, 92, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 92, 0, 0.3)";
            }}
          >
            <span style={{ fontSize: 16 }}>🛒</span>
            <span>Giỏ hàng</span>
            {cartCount > 0 && (
              <span
                style={{
                  background: "var(--white)",
                  color: "var(--primary)",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        )}

        {user ? (
          <>
            {/* Lịch sử đơn hàng - chỉ hiện với user, không hiện với admin */}
            {user.role !== "admin" && (
              <button
                type="button"
                onClick={() => navigate("orders")}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--white)",
                padding: "9px 16px",
                borderRadius: "50px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.35s",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'Exo 2', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,92,0,0.4)";
                e.currentTarget.style.background = "rgba(255,92,0,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,92,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span>📋</span>
              <span>Lịch sử đơn hàng</span>
            </button>
            )}

            {/* Admin */}
            {user.role === "admin" && (
              <button
                type="button"
                onClick={() => navigate("admin-dashboard")}
                style={{
                  background: "rgba(255,92,0,0.1)",
                  border: "1px solid rgba(255,92,0,0.25)",
                  color: "var(--primary)",
                  padding: "9px 16px",
                  borderRadius: "var(--radius-lg)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.35s",
                  fontFamily: "'Exo 2', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,92,0,0.18)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,92,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,92,0,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                ⚙️ Admin
              </button>
            )}

            {/* Hồ sơ */}
            <button
              type="button"
              onClick={() => navigate("profile")}
              title="Thông tin cá nhân"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--white)",
                padding: "9px 16px",
                borderRadius: "50px",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.35s",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'Exo 2', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,92,0,0.4)";
                e.currentTarget.style.background = "rgba(255,92,0,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,92,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span>👤</span>
              <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name || "Người dùng"}
              </span>
            </button>

            {/* Đăng xuất */}
            <button
              type="button"
              onClick={onLogout}
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: "var(--red)",
                padding: "9px 16px",
                borderRadius: "50px",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.35s",
                fontFamily: "'Exo 2', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate("login")}
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "var(--white)",
              padding: "10px 24px",
              borderRadius: "50px",
              fontSize: 14,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 4px 20px rgba(255, 92, 0, 0.35)",
              fontFamily: "'Exo 2', sans-serif",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(255, 92, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 92, 0, 0.35)";
            }}
          >
            Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
