// =====================================================
// utils/api.js – Tat ca cac ham goi API den Backend
// =====================================================
// LUONG HOAT DONG:
// File nay dong vai tro la "CAU NOI" giua Frontend (React) va Backend (Spring Boot)
// Tat ca cac request den Backend deu di qua day
//
// Cau truc chung:
//   1. Goi fetch() den endpoint tuong ung
//   2. Kem header: Content-Type, Authorization (JWT neu co)
//   3. Xu ly response:
//      - Neu response.ok = true -> tra ve data (response.json())
//      - Neu response.ok = false -> nem Error voi message tu server
//
// CAC NHOM API TRONG FILE NAY:
//   - AUTH: Dang nhap, dang ky, quen mat khau
//   - ORDER: Tao don, lay don, huy don
//   - PAYMENT: Xac nhan banking, tao URL VNPAY, lay ket qua VNPAY
//   - REVIEW: Lay danh gia, tao danh gia san pham
//   - PRODUCT: Lay danh sach, lay chi tiet san pham
//   - MESSAGE: Gui lien he, lay tin nhan
// =====================================================

// =============================================
// CONSTANTS
// =============================================

// API_BASE: Base URL cho tat ca cac API calls
// Vi React chay tren Vite (port 5173), Backend chay tren Spring Boot (port 8080)
// Proxy da duoc cau hinh trong vite.config.js de chuyen /api -> localhost:8080
// VD: /api/auth/login -> localhost:8080/api/auth/login
const API_BASE = "/api";

// =============================================
// HELPER FUNCTIONS
// =============================================

// Lay JWT token tu localStorage
// Token duoc luu khi user dang nhap thanh cong
// Su dung chung cho moi request can xac thuc
const getToken = () => localStorage.getItem("token");

// Tao header mac dinh cho request co xac thuc
// Tra ve object headers voi Content-Type + Authorization (neu co token)
// Cac ham API su dung getAuthHeaders() se tu dong co token neu user da dang nhap
const getAuthHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};


// =============================================
// AUTH API - Xac thuc nguoi dung
// =============================================
// Nhom nay xu ly: dang nhap, dang ky, quen mat khau
// =============================================

/**
 * Dang nhap nguoi dung
 * @param {string} username - Email hoac username
 * @param {string} password - Mat khau
 * @param {boolean} rememberMe - Co ghi nho dang nhap khong
 * @returns {Promise} - Tra ve { token, user } neu thanh cong
 *
 * LUONG:
 *   1. POST /api/auth/login voi username, password, rememberMe
 *   2. Backend tra ve JWT token + thong tin user
 *   3. FE luu vao localStorage: token, user
 *   4. Cac request tiep theo se tu dong kem token
 */
export const apiLogin = async (username, password, rememberMe = false) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, rememberMe }),
  });

  if (!response.ok) {
    // Server tra ve loi (VD: sai mat khau, tai khoan bi khoa)
    // Doc message tu server de hien thi cho nguoi dung
    const err = await response.json().catch(() => ({ message: "Đăng nhập thất bại" }));
    throw new Error(err.message || "Đăng nhập thất bại");
  }

  return response.json();
};

/**
 * Dang ky tai khoan moi
 * @param {string} fullName - Ho va ten day du
 * @param {string} email - Dia chi email
 * @param {string} phone - So dien thoai
 * @param {string} password - Mat khau (se duoc ma hoa phia backend)
 * @returns {Promise} - Tra ve thong tin user da tao
 *
 * LUONG:
 *   1. POST /api/auth/register voi thong tin
 *   2. Backend tao user trong DB, tra ve thong tin
 *   3. User tu dong dang nhap hoac chuyen sang trang dang nhap
 */
export const apiRegister = async (fullName, email, phone, password) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Backen nhan password_hash vi SQL co truong password_hash
    body: JSON.stringify({ fullName, email, phone, password_hash: password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Đăng ký thất bại" }));
    throw new Error(err.message || "Đăng ký thất bại");
  }

  return response.json();
};


// =============================================
// ORDER API - Don hang
// =============================================
// Nhom nay xu ly: tao don, lay don, huy don
// Co 2 loai don: don cua user da dang nhap va don guest
// =============================================

/**
 * Tao don hang cho nguoi da dang nhap
 * @param {Object} orderData - Du lieu don hang
 *   { recipientName, recipientPhone, shippingAddressLine1,
 *     shippingCity, shippingProvince, note, items[] }
 * @returns {Promise} - Tra ve OrderResponse { id, orderCode, status, ... }
 *
 * LUONG:
 *   1. POST /api/orders/create voi JWT token trong header
 *   2. Backend extract email tu JWT -> tim user trong DB
 *   3. Tao Order + OrderItem, luu vao DB
 *   4. Tra ve OrderResponse voi orderCode (VD: ORD-A3F2B1C7)
 *
 * LUU Y: Khong can verify quyen vi JWT da xac thuc nguoi dung
 */
export const apiCreateOrder = async (orderData) => {
  const response = await fetch(`${API_BASE}/orders/create`, {
    method: "POST",
    headers: getAuthHeaders(), // Tu dong kem JWT token
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Tạo đơn hàng thất bại" }));
    throw new Error(err.message || "Tạo đơn hàng thất bại");
  }

  return response.json();
};

/**
 * Tao don hang cho khach vang lai (guest)
 * @param {Object} orderData - Tuong tu apiCreateOrder
 * @returns {Promise} - Tra ve OrderResponse
 *
 * LUONG:
 *   1. POST /api/orders/guest (khong can JWT)
 *   2. Backend gan don cho user noi bo: __guest__@system.internal
 *   3. Tao Order + OrderItem nhu binh thuong
 *   4. Tra ve OrderResponse
 *
 * DAC DIEM:
 *   - Khong can dang nhap van dat duoc hang
 *   - Don guest co the bi huy boi chinh khach hoac admin
 *   - Khach khong the theo doi don trong "Don hang cua toi"
 */
export const apiCreateGuestOrder = async (orderData) => {
  const response = await fetch(`${API_BASE}/orders/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // Khong can Authorization
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Tạo đơn hàng thất bại" }));
    throw new Error(err.message || "Tạo đơn hàng thất bại");
  }

  return response.json();
};

/**
 * Lay danh sach don hang cua nguoi dung hien tai
 * @returns {Promise<Array>} - Mang cac OrderResponse
 *
 * LUONG:
 *   1. GET /api/orders/my-orders voi JWT token
 *   2. Backend extract email tu JWT -> tim don cua user do
 *   3. Tra ve danh sach don (da sort theo thoi gian giam dan)
 *
 * LUU Y: Chi tra ve don cua user da dang nhap
 *         Don guest nam trong localStorage, khong nam o day
 */
export const apiGetMyOrders = async () => {
  const response = await fetch(`${API_BASE}/orders/my-orders`, {
    method: "GET",
    headers: getAuthHeaders(), // Can JWT de biet ai dang yeu cau
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Không thể lấy danh sách đơn hàng" }));
    throw new Error(err.message || "Không thể lấy danh sách đơn hàng");
  }

  return response.json();
};

/**
 * Khach tu huy don hang cua minh
 * @param {number} orderId - ID don hang can huy
 *
 * LUONG:
 *   1. POST /api/orders/{id}/cancel voi JWT
 *   2. Backend kiem tra:
 *      - Don co thuoc ve user nay khong
 *      - Don dang o trang thai PENDING hoac PENDING_CONFIRM
 *   3. Cap nhat status = CANCELLED
 *   4. Neu la PENDING_CONFIRM -> paymentStatus ve UNPAID
 *   5. Neu stock da bi tru -> goi restoreStock() de hoan
 *
 * HAN CHE: Chi cho phep huy don o trang thai cho
 *         Khong the huy don da xac nhan, dang giao, da giao
 */
export const apiCancelOrder = async (orderId) => {
  const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Không thể hủy đơn hàng" }));
    throw new Error(err.message || "Không thể hủy đơn hàng");
  }

  return response.json();
};


// =============================================
// REVIEW API - Danh gia san pham
// =============================================
// Nhom nay xu ly: lay danh gia, tao danh gia
// =============================================

/**
 * Lay danh sach danh gia cua mot san pham
 * @param {number} productId - ID san pham
 * @returns {Promise} - Mang danh gia [{ rating, comment, user, createdAt }]
 *
 * DAC DIEM:
 *   - Khong can dang nhap, public endpoint
 *   - Tat ca nguoi deu co the xem danh gia
 */
export const apiGetProductReviews = async (productId) => {
  const response = await fetch(`${API_BASE}/reviews/product/${productId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Không thể lấy đánh giá sản phẩm");
  }

  return response.json();
};

/**
 * Gui danh gia moi cho san pham
 * @param {Object} param - { productId, rating (1-5), comment, phone }
 * @returns {Promise} - Danh gia da duoc tao
 *
 * LUONG:
 *   1. POST /api/reviews voi thong tin danh gia
 *   2. Neu co token -> danh gia duoc gan voi tai khoan
 *   3. Neu khong co token -> can phone de verify (danh gia guest)
 *   4. Tra ve danh gia da tao
 */
export const apiCreateReview = async ({ productId, rating, comment, phone }) => {
  const token = localStorage.getItem("token");
  console.log("Token for review:", token ? "exists" : "missing");

  const response = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Chi them Authorization header neu co token
      // Neu khong co -> server xu ly nhu guest review
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
    body: JSON.stringify({ productId, rating, comment, phone }),
  });

  console.log("Review response status:", response.status);
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Gửi đánh giá thất bại" }));
    throw new Error(err.message || "Gửi đánh giá thất bại");
  }

  return response.json();
};


// =============================================
// PRODUCT API - San pham
// =============================================
// Nhom nay xu ly: lay danh sach, lay chi tiet san pham
// =============================================

/**
 * Lay danh sach tat ca san pham
 * @returns {Promise} - Mang san pham [{ id, name, price, image, brand, ... }]
 *
 * DAC DIEM:
 *   - Public endpoint, khong can dang nhap
 *   - Du lieu co the co phan trang, loc, tim kiem
 *   - San pham bao gom thong tin: hinh anh, gia, thuong hieu, danh muc
 */
export const apiGetProducts = async () => {
  const response = await fetch(`${API_BASE}/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách sản phẩm");
  }

  return response.json();
};

/**
 * Lay thong tin chi tiet cua mot san pham
 * @param {number} id - ID san pham
 * @returns {Promise} - Chi tiet san pham
 *
 * LUONG:
 *   1. GET /api/products/{id}
 *   2. Backend tim product trong DB
 *   3. Tra ve day du thong tin: mo ta, thanh phan, huong dan su dung
 */
export const apiGetProductById = async (id) => {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông tin sản phẩm");
  }

  return response.json();
};


// =============================================
// MESSAGE API - Lien he
// =============================================
// Nhom nay xu ly: gui tin nhan lien he, lay tin nhan
// =============================================

/**
 * Gui tin nhan lien he cho admin
 * @param {Object} param - { subject, content }
 * @returns {Promise} - Tin nhan da gui
 *
 * LUONG:
 *   1. POST /api/messages/send voi JWT
 *   2. Backend luu tin nhan vao DB
 *   3. Admin nhan duoc thong bao co tin nhan moi
 */
export const apiSendMessage = async ({ subject, content }) => {
  const response = await fetch(`${API_BASE}/messages/send`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ subject, content }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Gửi tin nhắn thất bại" }));
    throw new Error(err.message || "Gửi tin nhắn thất bại");
  }
  return response.json();
};

/**
 * Lay danh sach tin nhan cua nguoi dung hien tai
 * @returns {Promise} - Mang tin nhan + phan hoi tu admin
 *
 * DAC DIEM:
 *   - Chi nguoi dung da dang nhap moi co the lay
 *   - Tra ve tin nhan cua minh + phan hoi cua admin
 */
export const apiGetMyMessages = async () => {
  const response = await fetch(`${API_BASE}/messages/my`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Không thể lấy tin nhắn");
  }
  return response.json();
};


// =============================================
// HELPER FUNCTIONS - Ham ho tro
// =============================================

/**
 * Kiem tra nguoi dung da dang nhap chua
 * @returns {boolean} - true neu co token, false neu khong
 *
 * SU DUNG:
 *   - CheckoutPage: Phan biet user/guest de goi API khac nhau
 *   - Navbar: Hien thi "Dang nhap" hoac "Tai khoan"
 *   - adminService: Kiem tra co phai admin khong
 */
export const isLoggedIn = () => {
  return !!getToken();
};

/**
 * Kiem tra nguoi dung co phai admin khong
 * @returns {boolean} - true neu role = "admin"
 *
 * SU DUNG:
 *   - Dieu huong sang trang admin
 *   - Hien thi / an cac chuc nang admin
 */
export const isAdmin = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return user.role === "admin";
  } catch {
    return false;
  }
};


// =============================================
// FORGOT PASSWORD API - Quen mat khau
// =============================================

/**
 * Gui yeu cau dat lai mat khau
 * @param {string} email - Email cua tai khoan can reset
 * @returns {Promise} - Thong bao huong dan
 *
 * LUONG:
 *   1. POST /api/auth/forgot-password voi email
 *   2. Backend gui email dat lai mat khau
 *   3. Nguoi dung bam link trong email -> trang reset
 */
export const apiForgotPassword = async (email) => {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Gửi yêu cầu thất bại");
  }
  return data;
};

/**
 * Dat lai mat khau moi
 * @param {string} token - Token reset tu email
 * @param {string} newPassword - Mat khau moi
 * @returns {Promise} - Thong bao thanh cong
 *
 * LUONG:
 *   1. POST /api/auth/reset-password voi token + mat khau moi
 *   2. Backend verify token, cap nhat mat khau
 *   3. Tra ve thong bao thanh cong
 */
export const apiResetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Đặt lại mật khẩu thất bại");
  }
  return data;
};


// =============================================
// BANKING PAYMENT API - Thanh toan chuyen khoan
// =============================================
// Nhom nay xu ly: xac nhan thanh toan banking, lay so don cho
// Su dung khi khach chon phuong thuc "Chuyen khoan ngan hang"
// =============================================

/**
 * Gui yeu cau xac nhan da chuyen khoan ngan hang
 * @param {number} orderId - ID don hang can xac nhan
 * @returns {Promise} - OrderResponse da cap nhat
 *
 * LUONG:
 *   1. POST /api/v1/banking/confirm/{orderId} voi JWT
 *   2. Backend kiem tra:
 *      - Don co ton tai khong
 *      - User co quyen khong (owner hoac guest)
 *      - paymentStatus hien tai la UNPAID
 *   3. Cap nhat:
 *      - paymentStatus: UNPAID -> PENDING_CONFIRM
 *      - paymentMethod: "BANKING"
 *      - paidAt: thoi gian hien tai
 *   4. Don bay gio cho phep admin xac nhan
 *
 * LUU Y:
 *   - Day chi la thong bao tu khach, KHONG phai thanh toan that su
 *   - Admin can kiem tra tai khoan BIDV de xac nhan
 *   - Ban can cau hinh thong tin BIDV trong BankingQRPage.jsx
 */
export const apiConfirmBankingPayment = async (orderId) => {
  const response = await fetch(`${API_BASE}/v1/banking/confirm/${orderId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Xác nhận thanh toán thất bại" }));
    throw new Error(err.message || "Xác nhận thanh toán thất bại");
  }

  return response.json();
};

/**
 * Lay so luong don hang dang cho xac nhan thanh toan banking
 * @returns {Promise} - { count: number }
 *
 * SU DUNG:
 *   - Admin Dashboard: Hien thi badge so don cho xac nhan
 *   - Giup admin biet co bao nhieu don can xu ly
 *
 * LUONG:
 *   1. GET /api/v1/banking/pending-count voi JWT (admin)
 *   2. Backend dem so don co paymentStatus = PENDING_CONFIRM
 *   3. Tra ve so luong
 */
export const apiGetPendingBankingCount = async () => {
  const response = await fetch(`${API_BASE}/v1/banking/pending-count`, {
    method: "GET",
    headers: getAuthHeaders(), // Chi admin moi co quyen
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Không thể lấy số đơn chờ" }));
    throw new Error(err.message || "Không thể lấy số đơn chờ");
  }

  return response.json();
};


// =============================================
// VNPAY PAYMENT API - Thanh toan qua cong VNPAY
// =============================================
// Nhom nay xu ly: tao URL thanh toan VNPAY, lay ket qua tra ve
// VNPAY la cong thanh toan trung gian, ho tro nhieu ngan hang
// =============================================

/**
 * Tao URL thanh toan VNPAY
 * @param {string} orderCode - Ma don hang (VD: ORD-A3F2B1C7)
 * @param {number} amount - So tien VND (khong nhan 100)
 * @param {string} locale - Ngon ngu: "vn" hoac "en"
 * @param {string} bankCode - Ma ngan hang (rong = chon tai VNPAY)
 * @param {string} email - Email khach hang (dung de verify guest order)
 * @returns {Promise<{paymentUrl: string, txnRef: string}>}
 *   - paymentUrl: Link den trang thanh toan VNPAY
 *   - txnRef: Ma tham chieu giao dich (VD: ORD-A3F2B1C7_1718294000)
 *
 * LUONG:
 *   1. POST /api/v1/vnpay/create voi orderCode, amount
 *   2. Backend:
 *      - Tim don hang trong DB (verify don ton tai)
 *      - Tao txnRef = orderCode + timestamp
 *      - Tao URL thanh toan VNPAY voi HMAC-SHA512 signature
 *      - Luu txnRef vao order
 *   3. Tra ve paymentUrl cho frontend
 *   4. Frontend redirect sang paymentUrl (trang VNPAY)
 *
 * SAU KHI THANH TOAN:
 *   - VNPAY redirect ve /vnpay-return (frontend)
 *   - VNPAY goi IPN ve /api/v1/vnpay/ipn (backend, server-to-server)
 */
export const apiCreateVNPayPayment = async (orderCode, amount, locale = "vn", bankCode = "", email = "") => {
  const response = await fetch(`${API_BASE}/v1/vnpay/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderCode, amount, locale, bankCode, email }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Không thể tạo thanh toán VNPAY" }));
    throw new Error(err.message || "Không thể tạo thanh toán VNPAY");
  }

  return response.json();
};

/**
 * Lay ket qua thanh toan tu VNPAY (sau khi redirect ve)
 * @param {Object} params - Cac tham so tu VNPAY return URL
 *   VD: { vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef, ... }
 * @returns {Promise} - { success, txnRef, amount, responseCode, ... }
 *
 * LUONG:
 *   1. Frontend lay cac tham so tu URL sau khi VNPAY redirect ve
 *   2. Goi GET /api/v1/vnpay/return?{params}
 *   3. Backend verify signature VNPAY
 *   4. Parse va tra ve ket qua
 *   5. Frontend hien thi thong bao thanh cong / that bai
 *
 * SU DUNG:
 *   - VNPayPaymentPage.jsx goi ham nay de lay ket qua
 *   - Hien thi trang ket qua phu hop
 */
export const apiGetVNPayReturnResult = async (params) => {
  // Chuyen object params thanh query string
  // VD: { code: "00", status: "00" } -> "code=00&status=00"
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/v1/vnpay/return?${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Không thể lấy kết quả thanh toán" }));
    throw new Error(err.message || "Không thể lấy kết quả thanh toán");
  }

  return response.json();
};
