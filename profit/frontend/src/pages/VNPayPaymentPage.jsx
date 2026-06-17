// =====================================================
// pages/VNPayPaymentPage.jsx – Trang kết quả thanh toán VNPAY
// =====================================================

import { useEffect, useState } from "react";
import { formatPrice } from "../utils/productHelpers";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Home, ShoppingBag } from "lucide-react";
import { apiGetVNPayReturnResult } from "../utils/api";

const VNPayPaymentPage = ({ showToast, navigate, onPlaceOrder }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processReturn = async () => {
      try {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        const savedOrder = localStorage.getItem("pendingVNPayOrder");
        const order = savedOrder ? JSON.parse(savedOrder) : null;
        const serverResult = await apiGetVNPayReturnResult(params);
        const isSuccess = !!serverResult?.success;

        localStorage.removeItem("pendingVNPayOrder");
        localStorage.removeItem("pendingVNPayOrderCode");

        setResult({
          success: isSuccess,
          orderCode: serverResult.orderCode || order?.orderCode || "",
          transactionId: serverResult.transactionId || "",
          amount: serverResult.amount || order?.total || 0,
          responseCode: serverResult.responseCode,
          message: serverResult.message || (isSuccess ? "Thanh toán thành công qua VNPAY!" : "Thanh toán thất bại"),
          order: order,
        });

        if (isSuccess) {
          showToast("Thanh toán VNPAY thành công!");
          localStorage.removeItem("cart");
          if (onPlaceOrder && order) {
            onPlaceOrder({
              ...order,
              paymentStatus: "PAID",
              status: "CONFIRMED",
              vnpTransactionNo: serverResult.transactionId || order.vnpTransactionNo,
            });
          }
        } else {
          showToast("Thanh toán VNPAY thất bại!");
        }
      } catch (err) {
        console.error("Lỗi xử lý kết quả VNPAY:", err);
        setError(err.message || "Có lỗi xảy ra khi xử lý kết quả thanh toán");
      } finally {
        setLoading(false);
      }
    };

    processReturn();
  }, [showToast, navigate, onPlaceOrder]);

  if (loading) {
    return (
      <div className="section">
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Loader2
            size={64}
            color="var(--primary)"
            className="spinning"
            style={{ margin: "0 auto 24px" }}
          />
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 32,
              marginBottom: 12,
            }}
          >
            ĐANG XỬ LÝ...
          </h2>
          <p style={{ color: "var(--gray)" }}>Đang xác minh kết quả thanh toán</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div style={{ textAlign: "center", padding: "60px 20px", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <XCircle size={80} color="var(--red)" style={{ margin: "0 auto" }} />
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 42,
              color: "var(--red)",
              marginBottom: 16,
            }}
          >
            CÓ LỖI XẢY RA
          </h2>

          <p style={{ color: "var(--gray)", fontSize: 16, marginBottom: 32 }}>
            {error}
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              style={{ padding: "14px 32px" }}
              onClick={() => navigate("home")}
            >
              <Home size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Về trang chủ
            </button>
            <button
              className="btn-outline"
              style={{ padding: "14px 32px" }}
              onClick={() => navigate("checkout")}
            >
              <ArrowLeft size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Thử lại thanh toán
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 520, margin: "0 auto" }}>
        {result?.success ? (
          <>
            {/* SUCCESS */}
            <div style={{ marginBottom: 24 }}>
              <CheckCircle size={80} color="var(--green)" style={{ margin: "0 auto" }} />
            </div>

            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 42,
                color: "var(--green)",
                marginBottom: 16,
              }}
            >
              THANH TOÁN THÀNH CÔNG!
            </h2>

            <p style={{ color: "var(--gray)", fontSize: 16, marginBottom: 8 }}>
              Cảm ơn bạn đã thanh toán qua VNPAY.
            </p>
            <p style={{ color: "var(--amber)", fontSize: 16, fontWeight: 600, marginBottom: 32 }}>
              Đơn hàng của bạn đang được xử lý.
            </p>

            {/* Order Info */}
            {result.order && (
              <div
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 32,
                  display: "inline-block",
                  textAlign: "left",
                  border: "1px solid #2a2a2a",
                  width: "100%",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--gray)", marginBottom: 16 }}>
                  Thông tin đơn hàng
                </div>
                {[
                  { label: "Mã đơn hàng", value: result.order.orderCode || result.orderCode },
                  { label: "Mã giao dịch VNPAY", value: result.transactionId },
                  { label: "Số tiền", value: formatPrice(result.amount), highlight: true },
                  { label: "Phương thức", value: "VNPAY" },
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 40,
                      fontSize: 14,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ color: "var(--gray)" }}>{label}</span>
                    <span
                      style={{
                        color: highlight ? "var(--primary)" : "var(--white)",
                        fontWeight: highlight ? 700 : 500,
                        fontFamily: highlight ? "'Bebas Neue', sans-serif" : "inherit",
                        fontSize: highlight ? 20 : 14,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn-primary"
                style={{ padding: "14px 32px" }}
                onClick={() => navigate("orders")}
              >
                <ShoppingBag size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Xem đơn hàng
              </button>
              <button
                className="btn-outline"
                style={{ padding: "14px 32px" }}
                onClick={() => navigate("home")}
              >
                <Home size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Về trang chủ
              </button>
            </div>
          </>
        ) : (
          <>
            {/* FAILED */}
            <div style={{ marginBottom: 24 }}>
              <XCircle size={80} color="var(--red)" style={{ margin: "0 auto" }} />
            </div>

            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 42,
                color: "var(--red)",
                marginBottom: 16,
              }}
            >
              THANH TOÁN THẤT BẠI
            </h2>

            <p style={{ color: "var(--gray)", fontSize: 16, marginBottom: 8 }}>
              {result?.message}
            </p>
            <p style={{ color: "var(--amber)", fontSize: 14, marginBottom: 32 }}>
              Vui lòng kiểm tra tài khoản và thử lại.
            </p>

            {/* Order Info */}
            {result?.order && (
              <div
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 32,
                  display: "inline-block",
                  textAlign: "left",
                  border: "1px solid #2a2a2a",
                  width: "100%",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--gray)", marginBottom: 16 }}>
                  Thông tin đơn hàng
                </div>
                {[
                  { label: "Mã đơn hàng", value: result.order.orderCode || result.orderCode },
                  { label: "Mã lỗi", value: result.responseCode },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 40,
                      fontSize: 14,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ color: "var(--gray)" }}>{label}</span>
                    <span style={{ color: "var(--white)", fontWeight: 500 }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn-primary"
                style={{ padding: "14px 32px" }}
                onClick={() => navigate("checkout")}
              >
                <ArrowLeft size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Thử lại thanh toán
              </button>
              <button
                className="btn-outline"
                style={{ padding: "14px 32px" }}
                onClick={() => navigate("home")}
              >
                <Home size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VNPayPaymentPage;
