// =====================================================
// pages/BankingQRPage.jsx – Trang Thanh Toán Chuyển Khoản
// =====================================================
// LUONG HOAT DONG:
// 1. Doc thong tin don hang tu localStorage (key: pendingBankingOrder)
// 2. Hien thi QR code ngan hang BIDV de khach quet
// 3. Khach mo app ngan hang, quet QR, chuyen khoan
// 4. Khach nhan nut "Da thanh toan" de gui yeu cau xac nhan
// 5. Backend cap nhat paymentStatus: UNPAID -> PENDING_CONFIRM
// 6. Admin se kiem tra bien dong so du tai khoan BIDV
//    de xac nhan thanh toan va doi status -> CONFIRMED
// =====================================================

import { useEffect, useState } from "react";
import { formatPrice } from "../utils/productHelpers";
import { apiConfirmBankingPayment, isLoggedIn } from "../utils/api";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

// =============================================
// THONG TIN TAI KHOAN NGAN HANG CUA ADMIN
// =============================================
// CẬP NHẬT thông tin thực tế khi triển khai production!
// Hiện tại đang dùng tài khoản test cho môi trường development
const BANK_INFO = {
  bankName: "BIDV",               // Ten ngan hang
  accountNumber: "8890014407",    // So tai khoan
  accountHolder: "Le Vu Hao",     // Ten chu tai khoan
  branch: "BIDV-PGD Phù Cát",    // Chi nhanh
};

// =============================================
// COMPONENT: BankingQRPage
// Props:
//   - order: Thong tin don hang tu localStorage
//   - navigate: Ham chuyen trang
//   - showToast: Ham hien thi thong bao
//   - onPlaceOrder: Callback khi xac nhan thanh toan thanh cong
//   - onClearCart: Callback xoa gio hang
// =============================================
const BankingQRPage = ({ order, navigate, showToast, onPlaceOrder, onClearCart }) => {

  // =============================================
  // STATE - QUAN LY TRANG THAI GIAO DIEN
  // =============================================

  // step: Quan ly buoc hien tai trong quy trinh
  // "qr"          - Hien thi man hinh QR code (mac dinh)
  // "confirming"  - Dang goi API xac nhan thanh toan
  // "success"     - Xac nhan thanh cong, hien thi thong bao
  const [step, setStep] = useState("qr");

  // error: Luu thong bao loi neu xay ra
  const [error, setError] = useState(null);

  // =============================================
  // TINH TOAN THONG TIN THANH TOAN
  // =============================================

  // paymentAmount: So tien can chuyen khoan
  // Lay tu order.total (FE tinh) hoac order.totalAmount (Backend tra)
  // Ep kieu Number() de tranh loi noi chuoi khi so tien la string
  const paymentAmount = Number(order?.total) || Number(order?.totalAmount) || 0;

  // =============================================
  // TAO NOI DUNG QR CODE
  // =============================================
  // QR code su dung dinh dang "Bank ID" (NAPAS)
  // Cau truc: bidv:{so_tai_khoan}?acc_name={ten}&amount={so_tien}&memo={ghi_chu}
  // Khi quet QR, app ngan hang se tu dong dien thong tin
  // Tai khoan nguoi nhan, so tien, noi dung chuyen khoan
  const qrContent = `bidv:${BANK_INFO.accountNumber}?acc_name=${BANK_INFO.accountHolder}&amount=${paymentAmount}&memo=Thanh toan don hang ${order?.orderCode || ""}`;

  // =============================================
  // XU LY XAC NHAN DA CHUYEN KHOAN
  // =============================================
  // handleConfirmPayment:
  // DUONG:
  //   1. Kiem tra order co ton tai khong
  //   2. Goi API POST /api/v1/banking/confirm/{orderId}
  //   3. Backend doi paymentStatus: UNPAID -> PENDING_CONFIRM
  //   4. Xoa gio hang (onClearCart)
  //   5. Them don vao danh sach orders (onPlaceOrder)
  //   6. Don bay gio cho phep admin xac nhan
  // =============================================
  const handleConfirmPayment = async () => {

    // BUOC 1: VALIDATE
    // Kiem tra xem co thong tin don hang khong
    // order.id can ton tai de goi API
    if (!order?.id) {
      setError("Không tìm thấy thông tin đơn hàng");
      return;
    }

    // BUOC 2: BAT DAU GOI API
    setStep("confirming");   // Hien thi man hinh loading
    setError(null);          // Xoa loi cu

    try {
      // =============================================
      // GOI API XAC NHAN THANH TOAN BANKING
      // =============================================
      // POST /api/v1/banking/confirm/{orderId}
      // Header: Authorization: Bearer {jwt_token}
      // Backend se thuc hien:
      //   - Kiem tra don ton tai
      //   - Kiem tra quyen so huu (user/guest)
      //   - paymentStatus: UNPAID -> PENDING_CONFIRM
      //   - paymentMethod: set = "BANKING"
      //   - paidAt: thoi gian hien tai
      // =============================================
      await apiConfirmBankingPayment(order.id);

      // =============================================
      // XU LY SAU KHI XAC NHAN THANH CONG
      // =============================================

      // Xoa gio hang
      // Chi goi khi da xac nhan thanh toan thanh cong
      // Vi: Don COD -> xoa ngay, Don Banking -> chi xoa khi xac nhan
      if (onClearCart) onClearCart();

      // Them don hang vao danh sach orders
      // App.jsx se them vao mang orders va cap nhat localStorage
      if (onPlaceOrder) onPlaceOrder(order);

      // Xoa thong tin don hang tam (da xu ly xong)
      // Don da chuyen sang trang thai PENDING_CONFIRM
      localStorage.removeItem("pendingBankingOrder");

      // Chuyen buoc hien thi thanh cong
      setStep("success");

      // Hien thi thong bao
      // Giai thich cho khach biet: admin se xac nhan trong thoi gian toi
      showToast(
        "Đã gửi yêu cầu xác nhận thanh toán. Vui lòng chờ admin xác nhận.",
      );

    } catch (err) {
      // XU LY LOI
      console.error("Lỗi xác nhận thanh toán:", err);
      setError(err.message || "Xác nhận thất bại. Vui lòng thử lại.");

      // Quay lai man hinh QR
      // Cho phep khach thu lai
      setStep("qr");
    }
  };

  // Quay lai trang checkout
  // Neu khach chua chuyen khoan, co the quay lai sua thong tin
  const handleGoBack = () => {
    navigate("checkout");
  };

  // =============================================
  // RENDER: GIAO DIEN THEO BUOC
  // =============================================

  // ==============================
  // MAN HINH 1: QR CODE (mac dinh)
  // ==============================
  if (step === "qr") {
    return (
      <div className="section">
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>

          {/* HEADER: Tieu de trang */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              THANH TOÁN{" "}
              <span style={{ color: "var(--primary)" }}>CHUYỂN KHOẢN</span>
            </h2>
            <p style={{ color: "var(--gray)", fontSize: 14 }}>
              Quét mã QR để chuyển khoản
            </p>
          </div>

          {/* KHUNG CHINH: QR code + thong tin tai khoan */}
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: 20,
              padding: 24,
              border: "1px solid #2a2a2a",
              textAlign: "center",
            }}
          >
            {/* ----- QR CODE ----- */}
            {/* QR code duoc tao bang Google Charts API */}
            {/* Encode URIComponent dam bao ky tu dac biet duoc xu ly dung */}
            {/* Kich thuoc: 200x200 pixel */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                display: "inline-block",
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`}
                alt="QR Code Thanh Toán"
                style={{ width: 200, height: 200, display: "block" }}
              />
            </div>

            {/* ----- SO TIEN NOI BAT ----- */}
            {/* Hien thi so tien can chuyen khoan */}
            {/* So tien nay phai chinh xac de admin de xac nhan */}
            <div
              style={{
                background: "rgba(255,92,0,0.08)",
                border: "1px solid rgba(255,92,0,0.2)",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 13, color: "var(--gray)", marginBottom: 4 }}>
                Số tiền cần chuyển
              </div>
              {/* Hien thi so tien voi dinh dang VND */}
              {/* VD: 750.000 đ */}
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 36,
                  color: "var(--primary)",
                  letterSpacing: 1,
                }}
              >
                {formatPrice(paymentAmount)}
              </div>
              {/* Hien thi ma don hang de admin doi soat */}
              <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 4 }}>
                Mã đơn:{" "}
                <strong style={{ color: "var(--white)" }}>
                  {order?.orderCode || ""}
                </strong>
              </div>
            </div>

            {/* ----- THONG TIN TAI KHOAN ----- */}
            {/* Hien thi thong tin tai khoan ngan hang nhan tien */}
            {/* Khach hang se nhap thong tin nay vao app ngan hang */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--white)",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>🏦</span> Thông tin tài khoản
              </div>

              {/* Hien thi tung truong thong tin */}
              {[
                { label: "Ngân hàng", value: BANK_INFO.bankName },
                { label: "Số tài khoản", value: BANK_INFO.accountNumber },
                { label: "Tên tài khoản", value: BANK_INFO.accountHolder },
                { label: "Chi nhánh", value: BANK_INFO.branch },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "var(--gray)" }}>{label}</span>
                  <span style={{ color: "var(--white)", fontWeight: 600 }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* ----- HUONG DAN ----- */}
            {/* Nhac nho khach hang cac buoc can lam */}
            <div
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertCircle
                  size={18}
                  color="var(--amber)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--gray)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: "var(--amber)" }}>Lưu ý:</strong> Vui
                  lòng chuyển khoản <strong>đúng số tiền</strong> và{" "}
                  <strong>nội dung ghi chú</strong> để admin
                  xác nhận nhanh chóng.
                </div>
              </div>
            </div>

            {/* ----- CAC NUT HANH DONG ----- */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* NUT CHINH: Da thanh toan online qua ngan hang */}
              {/* Khach da chuyen khoan xong, nhan nut nay de gui xac nhan */}
              <button
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "16px 0",
                  fontSize: 16,
                  fontWeight: 700,
                }}
                onClick={handleConfirmPayment}
              >
                ✓ Đã thanh toán online qua ngân hàng
              </button>

              {/* NUT PHU: Quay lai */}
              {/* Neu chua chuyen khoan, co the quay lai sua thong tin */}
              <button
                className="btn-outline"
                style={{
                  width: "100%",
                  padding: "14px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onClick={handleGoBack}
              >
                <ArrowLeft size={18} /> Quay lại
              </button>
            </div>
          </div>

          {/* FOOTER: Nhac nho khach hang */}
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--gray)",
              marginTop: 20,
            }}
          >
            Sau khi chuyển khoản, vui lòng nhấn "Đã thanh toán" để thông báo cho
            admin
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // MAN HINH 2: DANG XU LY
  // ==============================
  // Hien thi khi dang goi API xac nhan thanh toan
  // Spinner xoay de bao hieu dang cho
  if (step === "confirming") {
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
          <p style={{ color: "var(--gray)" }}>Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // ==============================
  // MAN HINH 3: THANH CONG
  // ==============================
  // Hien thi sau khi xac nhan thanh toan thanh cong
  // Don hang bay gio o trang thai PENDING_CONFIRM
  // Admin se kiem tra tai khoan BIDV de xac nhan
  if (step === "success") {
    return (
      <div className="section">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>

          {/* ICON THANH CONG */}
          <div style={{ marginBottom: 24 }}>
            <CheckCircle
              size={80}
              color="var(--green)"
              style={{ margin: "0 auto" }}
            />
          </div>

          {/* TIEU DE */}
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 42,
              color: "var(--green)",
              marginBottom: 16,
            }}
          >
            ĐÃ THANH TOÁN THÀNH CÔNG!
          </h2>

          <p style={{ color: "var(--gray)", fontSize: 16, marginBottom: 8 }}>
            Cảm ơn bạn đã chuyển khoản.
          </p>

          {/* THONG BAO CHO KHACH BIET */}
          {/* Admin can xac nhan thu cong bang cach kiem tra tai khoan BIDV */}
          <p
            style={{
              color: "var(--amber)",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 32,
            }}
          >
            Vui lòng chờ xác nhận của admin để hoàn tất đơn hàng.
          </p>

          {/* THONG TIN DON HANG */}
          {/* Hien thi de khach kiem tra */}
          {order && (
            <div
              style={{
                background: "var(--card-bg)",
                borderRadius: 16,
                padding: 20,
                marginBottom: 32,
                display: "inline-block",
                textAlign: "left",
                border: "1px solid #2a2a2a",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--gray)", marginBottom: 12 }}>
                Thông tin đơn hàng
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                {/* Ma don hang */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 40, fontSize: 14 }}>
                  <span style={{ color: "var(--gray)" }}>Mã đơn hàng</span>
                  <span style={{ color: "var(--white)", fontWeight: 700 }}>
                    {order.orderCode}
                  </span>
                </div>

                {/* So tien */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 40, fontSize: 14 }}>
                  <span style={{ color: "var(--gray)" }}>Số tiền</span>
                  <span
                    style={{
                      color: "var(--primary)",
                      fontWeight: 700,
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 20,
                    }}
                  >
                    {formatPrice(Number(order.total) || Number(order.totalAmount) || 0)}
                  </span>
                </div>

                {/* Trang thai thanh toan */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 40, fontSize: 14 }}>
                  <span style={{ color: "var(--gray)" }}>Trạng thái</span>
                  <span style={{ color: "var(--amber)", fontWeight: 700 }}>
                    Chờ xác nhận
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CAC NUT CHUYEN TRANG */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>

            {/* Xem danh sach don hang */}
            <button
              className="btn-primary"
              style={{ padding: "14px 32px" }}
              onClick={() => navigate("orders")}
            >
              Xem đơn hàng
            </button>

            {/* Ve trang chu */}
            <button
              className="btn-outline"
              style={{ padding: "14px 32px" }}
              onClick={() => navigate("home")}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Khong co gi de hien thi
  return null;
};

export default BankingQRPage;
