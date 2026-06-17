// =====================================================
// pages/ContactPage.jsx – Liên hệ: user gửi tin nhắn & xem hội thoại
// =====================================================

import { useState, useEffect, useRef } from "react";
import { apiSendMessage, apiGetMyMessages, isLoggedIn } from "../utils/api";

const ContactPage = ({ navigate, showToast, user }) => {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const prevMessagesLength = useRef(0);

  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (loggedIn) {
      loadMyMessages();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (myMessages.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
      setExpandedId(myMessages[0]?.id);
    }
    prevMessagesLength.current = myMessages.length;
  }, [myMessages]);

  const loadMyMessages = async () => {
    try {
      const data = await apiGetMyMessages();
      setMyMessages(data || []);
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) {
      showToast("Vui lòng nhập đầy đủ chủ đề và nội dung!");
      return;
    }
    if (!loggedIn) {
      showToast("Vui lòng đăng nhập để gửi liên hệ!");
      navigate("login");
      return;
    }
    setLoading(true);
    try {
      await apiSendMessage({ subject: form.subject, content: form.message });
      setSubmitted(true);
      showToast("Gửi liên hệ thành công!");
      await loadMyMessages();
    } catch (err) {
      showToast("Gửi thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ subject: "", message: "" });
    setSubmitted(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now - d;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return "Hôm nay " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      if (days === 1) return "Hôm qua";
      if (days < 7) return `${days} ngày trước`;
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      UNREAD: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.3)", label: "Chưa phản hồi" },
      READ: { bg: "rgba(255,255,255,0.05)", color: "var(--gray)", border: "rgba(255,255,255,0.1)", label: "Đã xem" },
      REPLIED: { bg: "rgba(16,185,129,0.1)", color: "var(--green)", border: "rgba(16,185,129,0.25)", label: "Đã phản hồi" },
    };
    const s = styles[status] || styles.UNREAD;
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}>
        {status === "REPLIED" && <span style={{ fontSize: 10 }}>✓</span>}
        {s.label}
      </span>
    );
  };

  const contactItems = [
    { label: "Địa chỉ", value: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh" },
    { label: "Điện thoại", value: "0901 234 567" },
    { label: "Email", value: "hello@profit.vn" },
    { label: "Giờ làm việc", value: "8:00 — 22:00 (Thứ 2 — CN)" },
  ];

  const unreadCount = myMessages.filter(m => m.status === "UNREAD").length;
  const repliedCount = myMessages.filter(m => m.status === "REPLIED").length;

  return (
    <div>
      <div className="page-hero">
        <h1>LIÊN <span>HỆ</span></h1>
        <p>Đội ngũ ProFit luôn sẵn sàng hỗ trợ bạn 24/7</p>
      </div>

      <section className="section">
        <div className="contact-layout">
          {/* Cột trái: thông tin + hộp thư */}
          <div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 36, letterSpacing: 2, color: "var(--white)", marginBottom: 8,
            }}>
              KẾT NỐI VỚI CHÚNG TÔI
            </h2>
            <p style={{ color: "var(--gray)", fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
              Bạn có câu hỏi, góp ý hoặc cần tư vấn? Đội ngũ của chúng tôi luôn
              sẵn sàng lắng nghe và hỗ trợ bạn.
            </p>

            {contactItems.map((item) => (
              <div key={item.label} className="contact-item">
                <div className="contact-icon" style={{ fontSize: 18 }}>
                  {item.label === "Địa chỉ" ? "📍" :
                   item.label === "Điện thoại" ? "📞" :
                   item.label === "Email" ? "✉️" : "⏰"}
                </div>
                <div>
                  <div className="contact-label">{item.label}</div>
                  <div className="contact-value">{item.value}</div>
                </div>
              </div>
            ))}

            {/* Hộp thư liên hệ */}
            {loggedIn ? (
              <div style={{ marginTop: 32 }}>
                {/* Header hộp thư */}
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(255,92,0,0.1)",
                    border: "1px solid rgba(255,92,0,0.2)",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 22 }}>📬</span>
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 22, letterSpacing: 1,
                      color: "var(--white)", margin: 0,
                    }}>
                      HỘP THƯ CỦA BẠN
                    </h3>
                    {myMessages.length > 0 ? (
                      <p style={{ fontSize: 12, color: "var(--gray)", margin: "2px 0 0" }}>
                        {myMessages.length} tin nhắn
                        {unreadCount > 0 && <span style={{ color: "#f59e0b" }}> · {unreadCount} chưa phản hồi</span>}
                        {repliedCount > 0 && <span style={{ color: "var(--green)" }}> · {repliedCount} đã phản hồi</span>}
                      </p>
                    ) : (
                      <p style={{ fontSize: 12, color: "var(--gray)", margin: "2px 0 0" }}>Chưa có tin nhắn nào</p>
                    )}
                  </div>
                </div>

                {myMessages.length === 0 ? (
                  <div style={{
                    background: "var(--card-bg)",
                    border: "1px solid #2a2a2a",
                    borderRadius: 14,
                    padding: "40px 24px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                    <p style={{ color: "var(--gray)", fontSize: 14, marginBottom: 6 }}>
                      Bạn chưa có tin nhắn nào
                    </p>
                    <p style={{ color: "var(--gray)", fontSize: 13, opacity: 0.7 }}>
                      Gửi tin nhắn cho đội ngũ ProFit ở bên cạnh
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {myMessages.map((msg) => {
                      const isExpanded = expandedId === msg.id;
                      return (
                        <div key={msg.id} style={{
                          background: "var(--card-bg)",
                          border: `1px solid ${msg.status === "REPLIED" ? "rgba(16,185,129,0.25)" : msg.status === "UNREAD" ? "rgba(255,92,0,0.25)" : "#2a2a2a"}`,
                          borderRadius: 12,
                          overflow: "hidden",
                          transition: "all 0.2s",
                          boxShadow: isExpanded ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
                        }}>
                          {/* Message header */}
                          <div
                            onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                            style={{
                              padding: "14px 16px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 12,
                              background: isExpanded ? "rgba(255,255,255,0.02)" : "transparent",
                              transition: "background 0.2s",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                <span style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "var(--white)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}>
                                  {msg.subject}
                                </span>
                                {getStatusBadge(msg.status)}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {msg.content}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: "var(--gray)" }}>
                                {formatDateShort(msg.createdAt)}
                              </span>
                              <span style={{ fontSize: 12, color: "var(--gray)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                                ▼
                              </span>
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div style={{
                              borderTop: "1px solid #2a2a2a",
                              padding: "16px",
                              background: "rgba(0,0,0,0.15)",
                              animation: "fadeIn 0.2s ease",
                            }}>
                              {/* User's original message */}
                              <div style={{ marginBottom: msg.replyContent ? 16 : 0 }}>
                                <div style={{ fontSize: 11, color: "var(--gray)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                                  Tin nhắn của bạn
                                </div>
                                <div style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                  borderRadius: 8,
                                  padding: "12px 14px",
                                  fontSize: 13,
                                  color: "var(--white)",
                                  lineHeight: 1.6,
                                }}>
                                  {msg.content}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}>
                                  Gửi lúc {formatDate(msg.createdAt)}
                                </div>
                              </div>

                              {/* Admin's reply */}
                              {msg.replyContent && (
                                <div>
                                  <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                                    Phản hồi từ ProFit
                                  </div>
                                  <div style={{
                                    background: "rgba(16,185,129,0.06)",
                                    border: "1px solid rgba(16,185,129,0.2)",
                                    borderRadius: 8,
                                    padding: "12px 14px",
                                    fontSize: 13,
                                    color: "var(--white)",
                                    lineHeight: 1.6,
                                  }}>
                                    {msg.replyContent}
                                  </div>
                                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}>
                                    Phản hồi lúc {formatDate(msg.repliedAt)}
                                  </div>
                                </div>
                              )}

                              {!msg.replyContent && msg.status !== "UNREAD" && (
                                <div style={{
                                  textAlign: "center",
                                  padding: "16px",
                                  color: "var(--gray)",
                                  fontSize: 13,
                                  opacity: 0.7,
                                }}>
                                  Tin nhắn đã được xem
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Refresh button */}
                <button
                  onClick={loadMyMessages}
                  style={{
                    marginTop: 12,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "8px 16px",
                    color: "var(--gray)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s",
                    marginLeft: "auto",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.color = "var(--white)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "var(--gray)";
                  }}
                >
                  🔄 Làm mới
                </button>
              </div>
            ) : null}
          </div>

          {/* Cột phải: form gửi liên hệ */}
          <div className="contact-form">
            {submitted ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 72, marginBottom: 20 }}>✅</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "var(--white)", marginBottom: 12 }}>
                  GỬI THÀNH CÔNG!
                </h3>
                <p style={{ color: "var(--gray)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                  Cảm ơn bạn đã liên hệ. Đội ngũ ProFit sẽ phản hồi trong vòng 24 giờ.
                </p>
                <button className="btn-primary" onClick={resetForm}>
                  Gửi liên hệ khác
                </button>
              </div>
            ) : (
              <>
                <h3 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 28, letterSpacing: 1, color: "var(--white)", marginBottom: 28,
                }}>
                  GỬI TIN NHẮN
                </h3>

                {!loggedIn ? (
                  <div style={{
                    background: "rgba(255,92,0,0.06)",
                    border: "1px solid rgba(255,92,0,0.15)",
                    borderRadius: "var(--radius-md)",
                    padding: "24px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                    <h4 style={{ color: "var(--white)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, marginBottom: 12 }}>
                      CẦN ĐĂNG NHẬP
                    </h4>
                    <p style={{ color: "var(--gray)", fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
                      Bạn cần đăng nhập để gửi tin nhắn liên hệ với đội ngũ ProFit.
                    </p>
                    <button className="btn-primary" style={{ width: "100%" }} onClick={() => navigate("login")}>
                      Đăng nhập ngay
                    </button>
                    <p style={{ color: "var(--gray)", fontSize: 13, marginTop: 12 }}>
                      Chưa có tài khoản?{" "}
                      <span style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 700 }}
                        onClick={() => navigate("register")}>
                        Đăng ký ngay
                      </span>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Chủ đề *</label>
                      <input
                        className="form-input"
                        name="subject"
                        placeholder="VD: Tư vấn sản phẩm Whey Protein"
                        value={form.subject}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nội dung *</label>
                      <textarea
                        className="form-input form-textarea"
                        name="message"
                        placeholder="Viết nội dung tin nhắn của bạn..."
                        value={form.message}
                        onChange={handleChange}
                        style={{ minHeight: 140 }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ width: "100%", padding: "16px 0", fontSize: 16 }}
                      disabled={loading}
                    >
                      {loading ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span className="spinning" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                          Đang gửi...
                        </span>
                      ) : "Gửi liên hệ ngay →"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
