// =====================================================
// components/Reviews.jsx – Component hiển thị đánh giá sản phẩm
// Props: productId, user
// =====================================================

import { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp, Loader2 } from "lucide-react";
import { apiGetProductReviews, apiCreateReview, isLoggedIn } from "../utils/api";

const Reviews = ({ productId, user, onReviewAdded }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check if current user is admin
  const isAdmin = user && user.role === "admin";

  // Load reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGetProductReviews(productId);
        setReviews(data || []);
      } catch (err) {
        console.error("Lỗi khi tải đánh giá:", err);
        setError("Không thể tải đánh giá");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting review:", { productId, rating, comment, phone });
    if (rating < 1 || rating > 5) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const newReview = await apiCreateReview({
        productId,
        rating,
        comment,
        phone,
      });
      console.log("Review submitted successfully:", newReview);

      setReviews([newReview, ...reviews]);
      setSubmitSuccess(true);
      setRating(5);
      setComment("");
      setPhone("");
      setShowForm(false);

      if (onReviewAdded) {
        onReviewAdded(newReview);
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      setSubmitError(err.message || "Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Render stars
  const renderStars = (count, interactive = false, onSelect = null) => {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => interactive && onSelect && onSelect(star)}
            style={{
              cursor: interactive ? "pointer" : "default",
              color: star <= count ? "#fbbf24" : "#4b5563",
              fontSize: interactive ? 28 : 16,
              transition: "transform 0.1s",
              transform: interactive && star <= rating ? "scale(1.1)" : "scale(1)",
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        padding: 40,
        textAlign: "center",
        color: "var(--gray)"
      }}>
        <Loader2 size={32} color="var(--primary)" className="spinning" style={{ margin: "0 auto 12px" }} />
        <p>Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 32 }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: "1px solid #2a2a2a"
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--white)", margin: 0 }}>
          <MessageSquare size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Đánh giá sản phẩm ({reviews.length})
        </h3>

        {isLoggedIn() && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Viết đánh giá
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--card-bg)",
            border: "1px solid #3a3a3a",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: 16, color: "var(--white)" }}>
            Đánh giá của bạn
          </h4>

          {/* Rating */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, color: "var(--gray)" }}>
              Đánh giá:
            </label>
            {renderStars(rating, true, setRating)}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, color: "var(--gray)" }}>
              Nhận xét (không bắt buộc):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: 12,
                background: "var(--dark3)",
                border: "1px solid #444",
                borderRadius: 8,
                color: "var(--white)",
                fontSize: 14,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, color: "var(--gray)" }}>
              Số điện thoại (để admin hỗ trợ khi cần):
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại của bạn"
              maxLength={10}
              pattern="[0-9]{10}"
              style={{
                width: "100%",
                padding: 12,
                background: "var(--dark3)",
                border: "1px solid #444",
                borderRadius: 8,
                color: "var(--white)",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
            <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>
              Số điện thoại sẽ được ẩn với người dùng khác. Chỉ admin mới thấy để hỗ trợ bạn.
            </div>
          </div>

          {/* Error/Success */}
          {submitError && (
            <div style={{
              color: "var(--red)",
              marginBottom: 12,
              fontSize: 14,
            }}>
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div style={{
              color: "var(--green)",
              marginBottom: 12,
              fontSize: 14,
            }}>
              Cảm ơn bạn đã đánh giá!
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "var(--primary)",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Loader2 size={16} className="spinning" />
                  Đang gửi...
                </span>
              ) : "Gửi đánh giá"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setComment("");
                setPhone("");
                setRating(5);
                setSubmitError(null);
              }}
              style={{
                background: "transparent",
                color: "var(--gray)",
                border: "1px solid #444",
                padding: "10px 24px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Not logged in hint */}
      {!isLoggedIn() && reviews.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "var(--gray)",
          background: "var(--card-bg)",
          borderRadius: 12,
          marginBottom: 24,
        }}>
          <MessageSquare size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ margin: 0 }}>Chưa có đánh giá nào.</p>
          <p style={{ marginTop: 8, fontSize: 14 }}>
            <span
              style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "login" }))}
            >
              Đăng nhập
            </span>{" "}
            để viết đánh giá.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          textAlign: "center",
          padding: 20,
          color: "var(--red)",
        }}>
          {error}
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "var(--card-bg)",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: 20,
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}>
                <div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 4,
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 14,
                    }}>
                      {review.userName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--white)" }}>
                        {review.userName || "Người dùng"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gray)" }}>
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {review.isVerifiedPurchase && (
                    <span style={{
                      fontSize: 11,
                      color: "var(--green)",
                      background: "rgba(34, 197, 94, 0.1)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      <ThumbsUp size={12} />
                      Đã mua hàng
                    </span>
                  )}
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <div style={{ fontSize: 12, color: "var(--gray)", lineHeight: 1.6 }}>
                  {review.comment}
                </div>
              )}

              {/* Phone - only visible to admin */}
              {isAdmin && review.phone && (
                <div style={{ fontSize: 12, color: "var(--primary)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📞</span>
                  <span>SĐT khách hàng: <strong>{review.phone}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
