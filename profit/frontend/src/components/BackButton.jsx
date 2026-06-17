// =====================================================
// components/BackButton.jsx – Nút Quay lại Premium
// Floating glass button với history stack
// Props: goBack, canGoBack, currentPage
// =====================================================

import { ArrowLeft, Home } from "lucide-react";

const BackButton = ({ goBack, canGoBack }) => {
  if (!canGoBack) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: 32,
        zIndex: 999,
        display: "flex",
        gap: 10,
        animation: "slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Nút Quay lại */}
      <button
        onClick={goBack}
        title=" Quay lại"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 22px",
          background: "rgba(21, 28, 44, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 92, 0, 0.25)",
          borderRadius: "50px",
          color: "var(--white)",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Exo 2', sans-serif",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 92, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
          e.currentTarget.style.borderColor = "rgba(255, 92, 0, 0.6)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 92, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
          e.currentTarget.style.background = "rgba(255, 92, 0, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.borderColor = "rgba(255, 92, 0, 0.25)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 92, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.06)";
          e.currentTarget.style.background = "rgba(21, 28, 44, 0.85)";
        }}
      >
        {/* Glow orb */}
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(180deg, rgba(255, 92, 0, 0.08), transparent)",
            borderRadius: "50px 50px 0 0",
            pointerEvents: "none",
          }}
        />

        {/* Icon */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            borderRadius: "50%",
            flexShrink: 0,
            boxShadow: "0 2px 12px rgba(255, 92, 0, 0.4)",
            transition: "transform 0.3s",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 5l-7 7 7 7" />
          </svg>
        </span>

        <span style={{ position: "relative", zIndex: 1 }}>Quay lại</span>
      </button>
    </div>
  );
};

export default BackButton;
