// =====================================================
// App.jsx – Ứng dụng chính, quản lý routing và state toàn cục


import { useState, useEffect } from "react";

import Navbar  from "./components/Navbar";
import Footer  from "./components/Footer";
import Toast   from "./components/Toast";
import Particles from "./components/Particles";
import BackButton from "./components/BackButton";
import ChatWidget from "./components/ChatWidget";

import HomePage          from "./pages/HomePage";
import ProductListPage   from "./pages/ProductListPage";   
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage          from "./pages/CartPage";
import CheckoutPage      from "./pages/CheckoutPage";       
import OrderPage         from "./pages/OrderPage";          
import OrderDetailPage   from "./pages/OrderDetailPage";    
import AboutPage         from "./pages/AboutPage";
import ContactPage       from "./pages/ContactPage";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import ProfilePage       from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import BankingQRPage    from "./pages/BankingQRPage";
import VNPayPaymentPage from "./pages/VNPayPaymentPage";

import DashboardPage     from "./pages/admin/DashboardPage";
import ProductManagePage from "./pages/admin/ProductManagePage";
import OrderManagePage   from "./pages/admin/OrderManagePage";
import UserManagePage    from "./pages/admin/UserManagePage";

import "./styles/global.css";
import { transformOrderFromBE } from "./utils/orderHelpers";

const App = () => {
  // ── Routing ──────────────────────────────────────
  const [currentPage, setCurrentPage]         = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [pendingBankingOrder, setPendingBankingOrder] = useState(null); // Đơn hàng đang chờ thanh toán banking

  // Detect URL path on mount (for direct navigation via redirect links)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/" || path === "") {
      setCurrentPage("home");
    } else if (path === "/reset-password" || path.startsWith("/reset-password")) {
      setCurrentPage("reset-password");
    } else if (path === "/banking-qr") {
      setCurrentPage("banking-qr");
    } else if (path === "/vnpay-return") {
      setCurrentPage("vnpay-return");
    } else if (path === "/login") {
      setCurrentPage("login");
    } else if (path === "/register") {
      setCurrentPage("register");
    } else if (path === "/contact") {
      setCurrentPage("contact");
    } else if (path === "/products") {
      setCurrentPage("products");
    } else if (path === "/about") {
      setCurrentPage("about");
    } else if (path === "/profile") {
      setCurrentPage("profile");
    }
  }, []);

  // ── Navigation History (Back Button) ──────────────
  // Những trang KHÔNG có trong lịch sử back (trang gốc)
  const TOP_LEVEL_PAGES = new Set([
    "home", "products", "about", "contact", "login", "register", "profile",
  ]);
  const [history, setHistory] = useState(["home"]);

  // ── Auth state ──────────────────────────────────────
  // user = null khi chưa đăng nhập
  // user = { id, name, email, phone, role: "user" | "admin" } khi đã đăng nhập
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // ── Giỏ hàng (Persistent - Lưu vào localStorage) ─────
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync cart với localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Sync user với localStorage mỗi khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ── [MỚI] Đơn hàng ───────────────────────────────
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Lấy đơn banking từ localStorage khi cần
  const [currentBankingOrder, setCurrentBankingOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("pendingBankingOrder");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync orders với localStorage
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // Sync pendingBankingOrder với localStorage
  useEffect(() => {
    if (currentBankingOrder) {
      localStorage.setItem("pendingBankingOrder", JSON.stringify(currentBankingOrder));
    } else {
      localStorage.removeItem("pendingBankingOrder");
    }
  }, [currentBankingOrder]);

  // ── Toast ─────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: "" });
  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  // ── Navigate ──────────────────────────────────────
  const [targetCategory, setTargetCategory] = useState(null);

  const navigate = (page, params = {}) => {
    // Push trang hiện tại vào history (nếu không phải trang top-level)
    if (!TOP_LEVEL_PAGES.has(page)) {
      setHistory((prev) => {
        if (prev[prev.length - 1] === currentPage) return prev;
        return [...prev, currentPage];
      });
    } else {
      setHistory(["home"]);
    }

    setCurrentPage(page);
    if (page === "products" && params.categoryId) {
      setTargetCategory(params.categoryId);
    } else if (page === "products") {
      setTargetCategory(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Handlers ──────────────────────────────────────
  const handleViewDetail = (product) => { setSelectedProduct(product); navigate("detail"); };
  const handleViewOrder  = (order)   => { setSelectedOrder(transformOrderFromBE(order)); navigate("order-detail"); };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      return found
        ? prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { product, qty: 1 }];
    });
    showToast(`✅ Đã thêm "${product.name}" vào giỏ!`);
  };

  const handleUpdateQty = (id, qty) => {
    if (qty <= 0) { handleRemove(id); return; }
    setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, qty } : i));
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
    showToast("🗑 Đã xóa sản phẩm khỏi giỏ hàng");
  };

  // [MỚI] Đặt hàng thành công: xóa giỏ, lưu đơn
  const handlePlaceOrder = (order) => {
    // order từ CheckoutPage đã là FE-format (có info, total, subtotal...)
    // nên KHÔNG cần transform lại
    setOrders((prev) => [...prev, order]);
    setCart([]);
    showToast("🎉 Đặt hàng thành công!");
  };

  // [MỚI] Admin cập nhật trạng thái đơn
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  // [MỚI] Login / Logout
  const handleLogin = (userData) => {
    setUser(userData);
    showToast(`👋 Xin chào, ${userData.name || userData.email}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setOrders([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("orders");
    navigate("home");
    showToast("Đã đăng xuất.");
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const newHistory = prev.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      setCurrentPage(previousPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return newHistory;
    });
  };

  const canGoBack = history.length > 1;

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── Render page ───────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {

      case "home":
        return <HomePage navigate={navigate} onAddToCart={handleAddToCart} onViewDetail={handleViewDetail} />;

      case "products":
        return <ProductListPage onAddToCart={handleAddToCart} onViewDetail={handleViewDetail} initialCategoryId={targetCategory} />;

      case "detail":
        return (
          <ProductDetailPage
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onViewDetail={handleViewDetail}
            navigate={navigate}
          />
        );

      case "cart":
        return (
          <CartPage
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            navigate={navigate}
          />
        );

      // ── [SỬA] Truyền thêm user + showToast ──────
      case "checkout":
        return (
          <CheckoutPage
            cart={cart}
            user={user}                          // ← THÊM
            onPlaceOrder={handlePlaceOrder}
            navigate={navigate}
            showToast={showToast}                // ← THÊM
          />
        );

      // ── [MỚI] Trang đặt hàng thành công ─────────
      case "order-success":
        return (
          <div className="section" style={{ textAlign: "center", padding: "80px 60px" }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: "var(--white)", marginBottom: 12 }}>
              ĐẶT HÀNG THÀNH CÔNG!
            </h1>
            <p style={{ color: "var(--gray)", fontSize: 16, marginBottom: 36 }}>
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn sớm nhất.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              {/* Chỉ hiện "Xem đơn hàng" nếu đã đăng nhập */}
              {user && (
                <button className="btn-primary" style={{ padding: "14px 32px" }}
                  onClick={() => navigate("orders")}>
                  Xem đơn hàng
                </button>
              )}
              <button className="btn-outline" style={{ padding: "14px 32px" }}
                onClick={() => navigate("home")}>
                Về trang chủ
              </button>
            </div>
          </div>
        );

      // ── [MỚI] Các trang mới ──────────────────────
      case "orders":
        if (user && user.role === "admin") { navigate("admin-dashboard"); return null; }
        return (
          <OrderPage
            user={user}
            navigate={navigate}
            onViewOrderDetail={handleViewOrder}
            showToast={showToast}
          />
        );

      case "order-detail":
        return <OrderDetailPage order={selectedOrder} navigate={navigate} onAddToCart={handleAddToCart} />;

      case "about":
        return <AboutPage navigate={navigate} />;

      case "contact":
        return <ContactPage showToast={showToast} />;

      case "login":
        return <LoginPage onLogin={handleLogin} navigate={navigate} />;

      case "register":
        return <RegisterPage onLogin={handleLogin} navigate={navigate} />;

      case "profile":
        return <ProfilePage navigate={navigate} user={user} showToast={showToast} />;

      case "reset-password":
        return <ResetPasswordPage showToast={showToast} />;

      case "banking-qr": {
        // LUÔN đọc order mới nhất từ localStorage
        const pendingOrder = (() => {
          try {
            const saved = localStorage.getItem("pendingBankingOrder");
            return saved ? JSON.parse(saved) : null;
          } catch { return null; }
        })();
        return <BankingQRPage order={pendingOrder} navigate={navigate} showToast={showToast} onPlaceOrder={handlePlaceOrder} onClearCart={() => setCart([])} />;
      }

      case "vnpay-return":
        return <VNPayPaymentPage showToast={showToast} navigate={navigate} onPlaceOrder={handlePlaceOrder} />;

      // ── Admin (guard quyền) ───────────────────────
      case "admin-dashboard":
        if (!user || user.role !== "admin") { navigate("login"); return null; }
        return <DashboardPage navigate={navigate} />;

      case "admin-products":
        if (!user || user.role !== "admin") { navigate("login"); return null; }
        return <ProductManagePage showToast={showToast} />;

      case "admin-orders":
        if (!user || user.role !== "admin") { navigate("login"); return null; }
        return <OrderManagePage onUpdateStatus={handleUpdateOrderStatus} showToast={showToast} />;

      case "admin-users":
        if (!user || user.role !== "admin") { navigate("login"); return null; }
        return <UserManagePage showToast={showToast} navigate={navigate} />;

      default:
        return <HomePage navigate={navigate} onAddToCart={handleAddToCart} onViewDetail={handleViewDetail} />;
      
    }
  };

  const isAdmin = currentPage.startsWith("admin-");

  return (
    <div>
      <Particles />

      <BackButton goBack={goBack} canGoBack={canGoBack} />

      {/* [SỬA] Truyền thêm user + onLogout */}
      <Navbar
        currentPage={currentPage}
        navigate={navigate}
        cartCount={cartCount}
        user={user}           // ← THÊM
        onLogout={handleLogout} // ← THÊM
      />

      <main>{renderPage()}</main>

      {!isAdmin && <Footer navigate={navigate} />}

      <Toast message={toast.message} visible={toast.visible} />

      {/* Chat Widget - Production Ready */}
      <ChatWidget />
    </div>
  );
};

export default App;
