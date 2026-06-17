import { useState } from "react";
import { apiResetPassword } from "../utils/api";

const ResetPasswordPage = ({ showToast }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    return (
      <div className="section">
        <div className="empty-state">
          <div style={{ fontSize: 64 }}>❌</div>
          <h3>Liên kết không hợp lệ</h3>
          <p>Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiResetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="section">
        <div style={{ maxWidth: 440, margin: "80px auto", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: "var(--white)", marginBottom: 12 }}>
            ĐẶT LẠI THÀNH CÔNG!
          </h2>
          <p style={{ color: "var(--gray)", fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>
            Mật khẩu của bạn đã được thay đổi thành công.
          </p>
          <a href="/" style={{
            display: "inline-block",
            padding: "14px 32px",
            background: "var(--primary)",
            color: "white",
            borderRadius: "var(--radius-md)",
            fontWeight: 700,
            textDecoration: "none",
          }}>
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="page-hero">
        <h1>ĐẶT LẠI <span>MẬT KHẨU</span></h1>
        <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {error && <div className="auth-error"><span>⚠️</span> {error}</div>}
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "16px 0", fontSize: 16 }}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
