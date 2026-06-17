// =====================================================
// pages/CheckoutPage.jsx – Trang Thanh Toán
// =====================================================
// LUONG HOAT DONG:
// 1. Hien thi thong tin giao hang (tu localStorage hoac profile user)
// 2. Hien thi tom tat don hang (subtotal, shipping, total)
// 3. Cho phep chon 1 trong 3 phuong thuc thanh toan:
//    - COD: Thanh toan khi nhan hang
//    - Banking: Chuyen khoan ngan hang (hien QR)
//    - VNPAY: Thanh toan qua cong VNPAY (redirect)
// 4. Khi nhan "Dat hang ngay":
//    - Goi API tao don hang len Backend
//    - Xu ly theo tung phuong thuc thanh toan da chon
//    - Luu don vao localStorage
//    - Chuyen huong hoac hien thi trang thanh cong
// =====================================================

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../utils/productHelpers";
import { ShoppingCart, Loader2, Banknote, Landmark, AlertCircle, CreditCard } from "lucide-react";
import { apiCreateOrder, apiCreateGuestOrder, apiCreateVNPayPayment, isLoggedIn } from "../utils/api";

// =============================================
// CONSTANTS & DEFAULT VALUES
// =============================================

// Dữ liệu mặc định cho thông tin giao hàng
// Các trường này sẽ được điền từ localStorage hoặc profile user
const DEFAULT_USER_INFO = {
  fullName: "",   // Họ tên người nhận
  phone: "",      // Số điện thoại người nhận
  email: "",      // Email (tùy chọn)
  address: "",    // Địa chỉ chi tiết (số nhà, đường)
  district: "",   // Quận/Huyện
  city: "",       // Thành phố/Tỉnh (BẮT BUỘC)
  province: "",    // Tỉnh/Thành phố (trùng city)
  note: "",       // Ghi chú giao hàng (tùy chọn)
};

// =============================================
// COMPONENT: CheckoutPage
// Props:
//   - cart: Mảng các sản phẩm trong giỏ hàng [{product, qty}]
//   - user: Thông tin user đã đăng nhập (null nếu guest)
//   - onPlaceOrder: Callback khi đặt hàng thành công (xóa cart, thêm vào orders)
//   - navigate: Hàm chuyển trang
//   - showToast: Hàm hiển thị thông báo
// =============================================
const CheckoutPage = ({ cart = [], user, onPlaceOrder, navigate, showToast }) => {

  // =============================================
  // STATE - Lưu trữ dữ liệu trên giao diện
  // =============================================

  // userInfo: Lưu thông tin giao hàng của khách
  // Khách đã đăng nhập: tự động điền từ profile
  // Khách vãng lai: điền thủ công hoặc từ localStorage
  const [userInfo, setUserInfo] = useState(DEFAULT_USER_INFO);

  // payMethod: Phương thức thanh toán được chọn
  // Giá trị: "cod" | "banking" | "vnpay"
  const [payMethod, setPayMethod] = useState("cod");

  // loadingProfile: Trạng thái đang tải thông tin profile
  // = true khi đang đọc localStorage để điền form
  const [loadingProfile, setLoadingProfile] = useState(true);

  // placing: Trạng thái đang xử lý đặt hàng
  // = true khi đang gọi API, disable nút "�ặt hàng ngay"
  const [placing, setPlacing] = useState(false);

  // orderError: Lưu thông báo lỗi nếu đặt hàng thất bại
  const [orderError, setOrderError] = useState(null);

  // =============================================
  // EFFECT: Load thong tin giao hang khi mount
  // =============================================
  useEffect(() => {
    try {
      // Tạo key localStorage:
      // - User đăng nhập: "userInfo_${email}" (mỗi user 1 profile riêng)
      // - Guest: "userInfo" (dùng chung)
      const storageKey = user ? `userInfo_${user.email}` : "userInfo";
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        // Đã có thông tin lưu trong localStorage
        // Merge với DEFAULT để đảm bảo đủ fields
        const parsed = JSON.parse(saved);
        setUserInfo({ ...DEFAULT_USER_INFO, ...parsed });
      } else if (user) {
        // Chưa có localStorage nhưng đã đăng nhập
        // Lấy thông tin cơ bản từ user object
        setUserInfo({
          ...DEFAULT_USER_INFO,
          fullName: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      }
    } catch { /* ignore */ }

    // Đánh dấu đã tải xong, hiển thị form
    setLoadingProfile(false);
  }, [user]);

  // =============================================
  // VALIDATION: Kiem tra da dien du thong tin chua
  // =============================================
  // hasRequiredInfo: = true khi đã điền đủ 4 trường bắt buộc:
  //   - Họ tên (fullName)
  //   - Số điện thoại (phone)
  //   - Địa chỉ (address)
  //   - Thành phố (city)
  // Nếu thiếu bất kỳ trường nào → không cho phép đặt hàng
  const hasRequiredInfo = useMemo(() => {
    return (
      userInfo.fullName?.trim() &&    // Họ tên không rỗng
      userInfo.phone?.trim() &&       // SĐT không rỗng
      userInfo.address?.trim() &&     // Địa chỉ không rỗng
      userInfo.city?.trim()           // Thành phố không rỗng
    );
  }, [userInfo]);

  // =============================================
  // TINH TOAN DON HANG
  // =============================================

  // subtotal: Tổng giá trị sản phẩm
  // = SUM(price * qty) cho tất cả sản phẩm trong giỏ
  const subtotal = useMemo(() =>
    cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart]
  );

  // shipping: Phí vận chuyển
  // - Miễn phí (0đ) khi subtotal >= 500.000đ
  // - 30.000đ khi subtotal < 500.000đ
  // QUY TAC: Khuyen khich khach mua nhieu hon de duoc free ship
  const shipping = subtotal >= 500000 ? 0 : 30000;

  // total: Tổng tiền phải thanh toán
  // = subtotal + shipping fee
  const total = subtotal + shipping;

  // =============================================
  // XU LY DAT HANG
  // =============================================
  // handlePlaceOrder: Hàm xử lý khi nhấn nút "Đặt hàng ngay"
  // LUONG:
  //   1. Validate thong tin giao hang
  //   2. Goi API tao don (user → /create, guest → /guest)
  //   3. Xu ly theo phuong thuc thanh toan:
  //      - COD: Luu localOrders → chuyen trang thanh cong
  //      - Banking: Luu pendingBankingOrder → chuyen trang QR
  //      - VNPAY: Goi API tao URL → redirect sang VNPAY
  // =============================================
  const handlePlaceOrder = async () => {

    // BƯỚC 1: VALIDATE
    // Kiểm tra đã điền đủ thông tin giao hàng chưa
    if (!hasRequiredInfo) {
      showToast("Bạn chưa lưu đủ thông tin giao hàng!");
      navigate("profile");  // Redirect sang trang profile để bổ sung
      return;
    }

    // Kiểm tra giỏ hàng có sản phẩm không
    if (cart.length === 0) {
      showToast("Giỏ hàng trống!");
      return;
    }

    // BƯỚC 2: BAT DAU XU LY
    setPlacing(true);   // Hiện loading, disable nút
    setOrderError(null); // Xóa lỗi cũ

    // buildOrderData: Tạo payload gửi lên API
    // Cấu trúc payload phải khớp với OrderRequest (backend)
    const buildOrderData = () => ({
      recipientName: userInfo.fullName,           // Tên người nhận
      recipientPhone: userInfo.phone,             // SĐT người nhận
      // Ghép địa chỉ: số nhà + đường + quận
      shippingAddressLine1: `${userInfo.address}${userInfo.district ? ", " + userInfo.district : ""}`,
      shippingCity: userInfo.city,               // Thành phố
      // Province = city nếu không có giá trị riêng
      shippingProvince: userInfo.province || userInfo.city,
      note: userInfo.note || "",                  // Ghi chú giao hàng
      // items: Danh sách sản phẩm trong đơn
      // Mỗi item gửi: productId và quantity
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.qty
      })),
    });

    try {
      // =============================================
      // BƯỚC 3: GOI API TAO DON HANG
      // =============================================
      // Phân biệt user đã đăng nhập và guest:
      // - User đã login: gọi apiCreateOrder (JWT token tự động được gắn)
      // - Guest: gọi apiCreateGuestOrder (không cần auth)
      // Backend sẽ trả về OrderResponse chứa:
      //   { id, orderCode, status, paymentStatus, totalAmount, ... }
      const result = isLoggedIn()
        ? await apiCreateOrder(buildOrderData())     // User đã đăng nhập
        : await apiCreateGuestOrder(buildOrderData()); // Khách vãng lai

      // =============================================
      // LƯU Ý QUAN TRỌNG VỀ totalAmount:
      // Backend chỉ tính subtotal (tổng tiền sản phẩm)
      // Backend KHÔNG tính shipping fee (phí vận chuyển)
      // Vì vậy, FE phải tự tính total = subtotal + shipping
      // và ghi đè vào object order trước khi lưu localStorage
      // =============================================

      // orderForStorage: Object đơn hàng lưu vào localStorage
      // Gồm dữ liệu từ backend + dữ liệu tính toán từ FE
      const orderForStorage = {
        ...result,          // Dữ liệu từ backend (id, orderCode, status...)
        total: total,       // FE tự tính: subtotal + shipping (quan trọng!)
        subtotal,           // Tổng tiền sản phẩm
        shipping,           // Phí vận chuyển
        discount: 0,        // Chưa hỗ trợ mã giảm giá
        info: userInfo,      // Thông tin giao hàng (để hiển thị lại)
        payMethod,           // Phương thức thanh toán đã chọn
        placedAt: new Date().toISOString(), // Thời gian đặt hàng
        guestOrder: !isLoggedIn(), // Đánh dấu đơn guest
      };

      // =============================================
      // BƯỚC 4: XU LY THEO PHUONG THUC THANH TOAN
      // =============================================

      // ==============================
      // NHÁNH 1: THANH TOAN QUA VNPAY
      // ==============================
      if (payMethod === "vnpay") {
        try {
          showToast("Đang chuyển đến VNPAY...");

          // Gọi API tạo URL thanh toán VNPAY
          // API sẽ trả về { paymentUrl, txnRef }
          // paymentUrl: Link đến trang thanh toán VNPAY sandbox
          // txnRef: Mã tham chiếu giao dịch VNPAY
          const { paymentUrl, txnRef } = await apiCreateVNPayPayment(
            result.orderCode,           // Mã đơn hàng (VD: ORD-A3F2B1C7)
            Math.round(total),          // Số tiền VND (làm tròn)
            "vn",                       // Ngôn ngữ: tiếng Việt
            "",                         // bankCode: để trống = chọn tại VNPAY
            userInfo.email || ""        // Email để verify cho guest order
          );

          // Lưu thông tin đơn hàng VNPAY vào localStorage
          // Phòng trường hợp user quay lại từ trang VNPAY
          orderForStorage.vnpTxnRef = txnRef;  // Lưu mã giao dịch VNPAY
          localStorage.setItem("pendingVNPayOrder", JSON.stringify(orderForStorage));
          localStorage.setItem("pendingVNPayOrderCode", result.orderCode);

          // CHUYEN HUONG: Chuyển trình duyệt sang trang thanh toán VNPAY
          // Sau khi thanh toán xong, VNPAY sẽ redirect về /vnpay-return
          window.location.href = paymentUrl;
          return; // Dừng ở đây, user sẽ quay lại từ VNPAY
        } catch (err) {
          // Lỗi khi tạo URL thanh toán VNPAY
          console.error("Lỗi tạo thanh toán VNPAY:", err);
          setOrderError("Không thể tạo thanh toán VNPAY: " + err.message);
          showToast("Lỗi thanh toán VNPAY!");
          setPlacing(false); // Enable lại nút đặt hàng
          return;
        }
      }

      // ==============================
      // NHÁNH 2: CHUYEN KHOAN NGAN HANG (BANKING QR)
      // ==============================
      if (payMethod === "banking") {
        showToast("Đang chuyển đến trang thanh toán...");

        // Lưu đơn hàng vào localStorage với key "pendingBankingOrder"
        // BankingQRPage sẽ đọc key này để hiển thị QR code
        localStorage.setItem("pendingBankingOrder", JSON.stringify(orderForStorage));

        // KHÔNG gọi onPlaceOrder ở đây!
        // Lý do: Đơn banking CHƯA thanh toán thành công
        // Giỏ hàng chỉ được xóa KHI user nhấn "Đã thanh toán"
        // trên trang BankingQRPage (sau khi chuyển khoản xong)

        // Chuyển sang trang QR code ngân hàng để quét và chuyển khoản
        navigate("banking-qr");
        return;
      }

      // ==============================
      // NHÁNH 3: COD (THANH TOAN KHI NHAN HANG)
      // ==============================

      // Lưu đơn hàng vào mảng localOrders trong localStorage
      // Mảng này lưu trữ tất cả đơn hàng COD/guest để hiển thị tại OrderPage
      const savedLocal = localStorage.getItem("localOrders");
      const localOrders = savedLocal ? JSON.parse(savedLocal) : [];
      localOrders.push(orderForStorage);  // Thêm đơn mới vào mảng
      localStorage.setItem("localOrders", JSON.stringify(localOrders));

      // Thông báo thành công
      // Message khác nhau cho user đã đăng nhập và guest
      showToast(isLoggedIn()
        ? "Đặt hàng thành công!"
        : "Đặt hàng thành công! Cảm ơn bạn."
      );

      // Gọi callback để App.jsx xử lý:
      // - Xóa giỏ hàng (cart = [])
      // - Thêm đơn hàng vào danh sách orders
      onPlaceOrder(orderForStorage);

      // Chuyển sang trang xác nhận đặt hàng thành công
      navigate("order-success");

    } catch (err) {
      // Xử lý lỗi khi gọi API tạo đơn hàng
      // (Lỗi mạng, server trả về lỗi, validation fail...)
      console.error("Lỗi khi đặt hàng:", err);
      setOrderError(err.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      showToast("Đặt hàng thất bại!");
    } finally {
      // LUÔN chạy: Enable lại nút đặt hàng dù thành công hay thất bại
      setPlacing(false);
    }
  };

  // =============================================
  // RENDER: GIAO DIỆN CHECKOUT
  // =============================================

  // Trường hợp 1: Giỏ hàng trống
  // Hiển thị thông báo và nút quay lại mua sắm
  if (cart.length === 0) {
    return (
      <div className="section">
        <div className="empty-state">
          <div className="empty-icon"><ShoppingCart size={72} color="var(--primary)" /></div>
          <h3>Giỏ hàng trống</h3>
          <p>Vui lòng thêm sản phẩm trước khi thanh toán.</p>
          <button className="btn-primary" onClick={() => navigate("products")}>Mua sắm ngay</button>
        </div>
      </div>
    );
  }

  // Trường hợp 2: Đang tải thông tin profile
  // Hiển thị spinner chờ load xong mới hiển thị form
  if (loadingProfile) {
    return (
      <div className="section">
        <div className="empty-state">
          <Loader2 size={48} color="var(--primary)" className="spinning" style={{ margin: "0 auto 12px", display: "block" }} />
          <h2>Đang tải...</h2>
        </div>
      </div>
    );
  }

  // Trường hợp 3: Form checkout chính
  // Layout 2 cột:
  // - Cột trái: Form thông tin giao hàng + chọn phương thức thanh toán
  // - Cột phải: Tóm tắt đơn hàng (danh sách sản phẩm, tạm tính, ship, tổng cộng)
  return (
    <div>
      {/* HEADER: Tiêu đề trang */}
      <div className="page-hero">
        <h1>THANH <span>TOÁN</span></h1>
        <p>Xác nhận thông tin & chọn phương thức thanh toán</p>
      </div>

      <section className="section">
        <div className="checkout-layout">

          {/* ===== CỘT TRÁI: Form thông tin ===== */}
          <div className="checkout-form-col">

            {/* ---- Card 1: Thông tin giao hàng ---- */}
            <div className="checkout-card">
              <h3 className="checkout-card-title">📦 Thông tin giao hàng</h3>

              {/* Nếu đã có đủ thông tin: hiển thị dạng read-only */}
              {hasRequiredInfo ? (
                <div>
                  {/* Hiển thị từng trường thông tin */}
                  {[
                    { label: "Họ và tên", value: userInfo.fullName },
                    { label: "Số điện thoại", value: userInfo.phone },
                    { label: "Email", value: userInfo.email || "Chưa cập nhật" },
                    {
                      label: "Địa chỉ",
                      // Ghép: address + district + city + province
                      value: [userInfo.address, userInfo.district, userInfo.city, userInfo.province].filter(Boolean).join(", ")
                    },
                    // Ghi chú chỉ hiển thị nếu có dữ liệu
                    ...(userInfo.note ? [{ label: "Ghi chú", value: userInfo.note }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="summary-row"
                      style={{ borderBottom: "1px solid rgba(255,92,0,0.05)", paddingBottom: 12, marginBottom: 12 }}>
                      <span style={{ color: "var(--gray)", fontSize: 13 }}>{label}</span>
                      <span style={{ color: "var(--white)", fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>
                        {value}
                      </span>
                    </div>
                  ))}

                  {/* Cảnh báo cho khách chưa đăng nhập */}
                  {/* Guest không thể theo dõi đơn hàng dễ dàng */}
                  {!isLoggedIn() && (
                    <div style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "14px",
                      marginTop: 8,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--amber)", marginBottom: 8, fontWeight: 700, fontSize: 13 }}>
                        <AlertCircle size={16} /> Lưu ý
                      </div>
                      <p style={{ fontSize: 13, color: "var(--gray)", margin: 0, lineHeight: 1.7 }}>
                        Bạn chưa đăng nhập.
                        <span style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("login")}>
                          {" "}Đăng nhập ngay
                        </span>
                        {" "}để quản lý đơn hàng tốt hơn.
                      </p>
                    </div>
                  )}

                  {/* Nút chỉnh sửa thông tin giao hàng */}
                  <button className="btn-outline" style={{ marginTop: 16 }} onClick={() => navigate("profile")}>
                    Chỉnh sửa thông tin
                  </button>
                </div>
              ) : (
                /* Nếu chưa có thông tin: hiển thị nút chuyển sang profile */
                <div className="empty-state" style={{ padding: "20px 0" }}>
                  <div className="empty-icon">👤</div>
                  <h3>Chưa có thông tin giao hàng</h3>
                  <p>Vui lòng lưu thông tin cá nhân để đặt hàng nhanh hơn.</p>
                  <button className="btn-primary" onClick={() => navigate("profile")}>
                    Cập nhật thông tin
                  </button>
                </div>
              )}
            </div>

            {/* ---- Card 2: Phương thức thanh toán ---- */}
            <div className="checkout-card">
              <h3 className="checkout-card-title">💳 Phương thức thanh toán</h3>

              {/* Danh sách 3 phương thức thanh toán */}
              {/* Radio button được ẩn, dùng label clickable */}
              <div className="pay-methods">
                {[
                  // COD: Thanh toán khi nhận hàng
                  // Ưu điểm: Không cần thanh toán trước, tiện lợi
                  // Nhược điểm: Shop phải thu tiền khi giao
                  { id: "cod", icon: <Banknote size={24} />, label: "Thanh toán khi nhận hàng (COD)" },

                  // Banking: Chuyển khoản ngân hàng qua QR code
                  // Ưu điểm: Xác nhận nhanh, không cần tiền mặt
                  // Nhược điểm: Khách phải có app ngân hàng
                  { id: "banking", icon: <Landmark size={24} />, label: "Chuyển khoản ngân hàng (ATM/Ví)" },

                  // VNPAY: Cổng thanh toán trực tuyến
                  // Ưu điểm: Tự động xác nhận qua IPN, nhiều bank hỗ trợ
                  // Nhược điểm: Phụ thuộc bên thứ 3 (VNPAY)
                  { id: "vnpay", icon: <CreditCard size={24} />, label: "Thanh toán qua VNPAY (QR/ATM)" },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`pay-option ${payMethod === m.id ? "active" : ""}`}
                  >
                    {/* Radio input ẩn để handle state */}
                    <input
                      type="radio"
                      name="pay"
                      value={m.id}
                      checked={payMethod === m.id}
                      onChange={() => setPayMethod(m.id)}
                      style={{ display: "none" }}
                    />
                    <span className="pay-icon">{m.icon}</span>
                    <span className="pay-label">{m.label}</span>
                    {/* Hiệu ứng check khi được chọn */}
                    {payMethod === m.id && (
                      <span style={{ marginLeft: "auto", color: "var(--green)", fontWeight: 700 }}>✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* ---- Hiển thị lỗi nếu có ---- */}
            {orderError && (
              <div style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "var(--red)",
                fontSize: 14,
              }}>
                <AlertCircle size={18} />
                <span>{orderError}</span>
              </div>
            )}
          </div>

          {/* ===== CỘT PHẢI: Tóm tắt đơn hàng ===== */}
          <div className="cart-summary">
            <h3 className="summary-title">Đơn hàng của bạn</h3>

            {/* Danh sách sản phẩm trong giỏ */}
            <div style={{ marginBottom: 16 }}>
              {cart.map((item) => (
                <div key={item.product.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}>
                  {/* Hình ảnh + tên sản phẩm */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {/* Khung ảnh sản phẩm với nền cam mờ */}
                    <div style={{
                      background: "rgba(255,92,0,0.06)",
                      borderRadius: "var(--radius-sm)",
                      padding: 6,
                      border: "1px solid rgba(255,92,0,0.08)",
                    }}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{ width: 40, height: 40, objectFit: "contain" }}
                        onError={(e) => { e.target.style.display = "none"; }} // Ẩn ảnh lỗi
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--white)" }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gray)" }}>
                        x{item.qty}  {/* Số lượng */}
                      </div>
                    </div>
                  </div>

                  {/* Thành tiền = giá × số lượng */}
                  <span style={{
                    fontWeight: 700,
                    color: "var(--primary)",
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 18,
                  }}>
                    {formatPrice(item.product.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            {/* Dòng tạm tính và phí vận chuyển */}
            {[
              { label: "Tạm tính", value: formatPrice(subtotal) },
              {
                label: "Phí vận chuyển",
                // "Miễn phí" nếu >= 500K, ngược lại hiện số tiền
                value: shipping === 0 ? "Miễn phí" : formatPrice(shipping),
                highlight: shipping === 0  // Bôi xanh nếu free ship
              },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="summary-row">
                <span>{label}</span>
                <span style={{
                  color: highlight ? "var(--green)" : "inherit",
                  fontWeight: highlight ? 700 : 400
                }}>
                  {value}
                </span>
              </div>
            ))}

            <div className="summary-divider" />

            {/* DÒNG TỔNG CỘNG - Nổi bật nhất */}
            <div className="summary-row summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* ===== NÚT ĐẶT HÀNG ===== */}
            {/* Disable khi: chưa có thông tin HOẶC đang xử lý */}
            <button
              className="btn-primary"
              style={{
                width: "100%",
                padding: "16px 0",
                marginTop: 20,
                fontSize: 16,
                boxShadow: "0 4px 20px rgba(255,92,0,0.3)"
              }}
              onClick={handlePlaceOrder}
              disabled={!hasRequiredInfo || placing}
            >
              {/* Thay đổi text khi đang xử lý */}
              {placing ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Loader2 size={18} className="spinning" /> Đang xử lý...
                </span>
              ) : "Đặt hàng ngay →"}
            </button>

            {/* Cảnh báo không tắt trình duyệt khi đang xử lý */}
            {placing && (
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--gray)", marginTop: 8 }}>
                Vui lòng chờ, không tắt trình duyệt...
              </p>
            )}

            {/* Nút quay lại giỏ hàng */}
            <button
              className="btn-outline"
              style={{ width: "100%", padding: "12px 0", marginTop: 10 }}
              onClick={() => navigate("cart")}
            >
              ← Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;
