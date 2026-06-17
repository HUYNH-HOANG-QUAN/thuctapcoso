// =====================================================
// pages/RegisterPage.jsx – Trang đăng ký Premium
// =====================================================

import { useState } from "react";
import { apiRegister } from "../utils/api";

const RegisterPage = ({ onLogin, navigate }) => {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    const { fullName, email, phone, password, confirm } = form;

    if (!fullName || !email || !password || !confirm) {
      setError("Vui lòng điền đầy đủ thông tin."); return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự."); return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp."); return;
    }

    setLoading(true);
    try {
      await apiRegister(fullName, email, phone, password);
      navigate("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    width: "100%",
    padding: "14px 18px",
    borderRadius: "var(--radius-lg)",
    border: focused
      ? "1px solid rgba(255,92,0,0.5)"
      : "1px solid rgba(255,255,255,0.06)",
    background: "rgba(7, 9, 15, 0.5)",
    color: "var(--white)",
    fontSize: 15,
    fontFamily: "'Nunito', sans-serif",
    outline: "none",
    transition: "all 0.35s",
    boxShadow: focused ? "0 0 0 3px rgba(255,92,0,0.1)" : "none",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      <div className="auth-card" style={{ maxWidth: 520, position: "relative", zIndex: 1 }}>
        {/* Glow accent */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: "linear-gradient(90deg, var(--primary), rgba(139,92,246,0.8), var(--primary))",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
        }} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36,
            color: "var(--primary)",
            letterSpacing: 3,
            textShadow: "0 0 20px rgba(255,92,0,0.3)",
            marginBottom: 8,
          }}>
            Pro<span style={{ color: "var(--white)" }}>Fit</span>
          </div>
          <p style={{ color: "var(--gray)", fontSize: 14, fontWeight: 600 }}>
            Tạo tài khoản miễn phí — chỉ 30 giây 🚀
          </p>
        </div>

        {/* Họ tên + SĐT */}
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
          <div className="form-group">
            <label className="form-label" style={{ display: "block", marginBottom: 10 }}>Họ và tên *</label>
            <FocusedInput name="fullName" placeholder="Nguyễn Văn A" value={form.fullName}
              onChange={handleChange} style={inputStyle} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: "block", marginBottom: 10 }}>Số điện thoại</label>
            <FocusedInput name="phone" placeholder="0901 234 567" value={form.phone}
              onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* Email */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: "block", marginBottom: 10 }}>Email *</label>
          <FocusedInput type="email" name="email" placeholder="email@example.com"
            value={form.email} onChange={handleChange} style={inputStyle} />
        </div>

        {/* Mật khẩu + Xác nhận */}
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
          <div className="form-group">
            <label className="form-label" style={{ display: "block", marginBottom: 10 }}>Mật khẩu *</label>
            <div style={{ position: "relative" }}>
              <FocusedInput
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={handleChange}
                style={{ ...inputStyle(false), paddingRight: 48 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--gray)", fontSize: 18, cursor: "pointer",
                }}>
                {showPass ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: "block", marginBottom: 10 }}>Xác nhận mật khẩu *</label>
            <FocusedInput type="password" name="confirm" placeholder="Nhập lại mật khẩu"
              value={form.confirm} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* Password strength */}
        {form.password.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 8, fontWeight: 700 }}>
              Độ mạnh mật khẩu:
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { threshold: 1, color: "#ef4444" },
                { threshold: 3, color: "#f59e0b" },
                { threshold: 5, color: "#3b82f6" },
                { threshold: 7, color: "var(--green)" },
              ].map(({ threshold, color }) => (
                <div key={threshold} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: form.password.length >= threshold ? color : "rgba(255,255,255,0.06)",
                  transition: "background 0.4s",
                  boxShadow: form.password.length >= threshold ? `0 0 8px ${color}` : "none",
                }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--gray-dark)", marginTop: 6 }}>
              {form.password.length < 4 ? "Yếu" : form.password.length < 6 ? "Trung bình" : form.password.length < 8 ? "Khá mạnh" : "Mạnh"}
            </div>
          </div>
        )}

        {/* Điều khoản */}
        <p style={{ fontSize: 12, color: "var(--gray)", marginBottom: 20, lineHeight: 1.7 }}>
          Bằng cách đăng ký, bạn đồng ý với{" "}
          <span style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 700 }}>Điều khoản dịch vụ</span>{" "}
          và <span style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 700 }}>Chính sách bảo mật</span>.
        </p>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          className="btn-primary"
          style={{ width: "100%", padding: "16px 0", fontSize: 16 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span className="spinning" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
              Đang tạo tài khoản...
            </span>
          ) : "Tạo tài khoản ngay"}
        </button>

        <div className="auth-divider"><span>hoặc</span></div>

        <div style={{ textAlign: "center", fontSize: 14, color: "var(--gray)" }}>
          Đã có tài khoản?{" "}
          <span
            style={{ color: "var(--primary)", fontWeight: 800, cursor: "pointer" }}
            onClick={() => navigate("login")}
          >
            Đăng nhập ngay
          </span>
        </div>
      </div>
    </div>
  );
};

const FocusedInput = ({ style, ...props }) => {
  const [focused, setFocused] = useState(false);
  const resolvedStyle = typeof style === "function" ? style(focused) : { ...style };
  return (
    <input
      {...props}
      style={resolvedStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

export default RegisterPage;
