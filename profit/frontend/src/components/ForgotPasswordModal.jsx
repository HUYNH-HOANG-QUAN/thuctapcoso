import { useState } from "react";
import { apiForgotPassword } from "../utils/api";

const ForgotPasswordModal = ({ onClose, onSwitch }) => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Vui lòng nhập email."); return; }
    setLoading(true);
    setError("");
    try {
      const data = await apiForgotPassword(email);
      if (data.demo && data.resetLink) {
        setResetLink(data.resetLink);
      }
      setStep("success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "var(--card-bg)", borderRadius: 16,
        border: "1px solid #2a2a2a",
        padding: 32, width: "100%", maxWidth: 420,
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", color: "var(--gray)",
          fontSize: 20, cursor: "pointer",
        }}>✕</button>

        {step === "email" && (
          <>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "var(--white)", marginBottom: 8 }}>
              QUÊN MẬT KHẨU
            </h3>
            <p style={{ color: "var(--gray)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.
            </p>
            <form onSubmit={handleSubmitEmail}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              {error && <div className="auth-error"><span>⚠️</span> {error}</div>}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "14px 0", marginTop: 8 }}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Gửi liên kết"}
              </button>
            </form>
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--gray)", marginTop: 16 }}>
              Nhớ mật khẩu?{" "}
              <span style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 700 }} onClick={onSwitch}>
                Đăng nhập ngay
              </span>
            </p>
          </>
        )}

        {step === "success" && (
          <>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "var(--white)", marginBottom: 12 }}>
                KIỂM TRA EMAIL!
              </h3>
              <p style={{ color: "var(--gray)", fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
                Nếu email <strong style={{ color: "var(--white)" }}>{email}</strong> tồn tại trong hệ thống,
                bạn sẽ nhận được liên kết đặt lại mật khẩu.
              </p>
              {resetLink && (
                <div style={{
                  background: "rgba(255,92,0,0.06)",
                  border: "1px solid rgba(255,92,0,0.2)",
                  borderRadius: 8, padding: "14px",
                  marginBottom: 20, textAlign: "left",
                }}>
                  <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700, marginBottom: 6 }}>
                    Demo - Nhấn link bên dưới để reset:
                  </div>
                  <a href={resetLink} style={{ fontSize: 13, color: "var(--white)", wordBreak: "break-all" }}>
                    {resetLink}
                  </a>
                </div>
              )}
              <button className="btn-primary" style={{ width: "100%", padding: "14px 0" }} onClick={onSwitch}>
                Quay lại đăng nhập
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
