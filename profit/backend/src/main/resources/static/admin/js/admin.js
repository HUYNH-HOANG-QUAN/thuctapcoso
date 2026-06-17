// ═══════════════════════════════════════════════════════════════
//  admin.js — Core utilities, API layer, Router, DeleteConfirm
//  Shared across ALL admin pages
// ═══════════════════════════════════════════════════════════════

/* ───────────────────────────────────────────────────────────────
   DB CONFIG  ← Set apiBase and token once DB is connected
─────────────────────────────────────────────────────────────── */
const pathPrefixBeforeAdmin = window.location.pathname.split("/admin")[0] || "";
const APP_CONTEXT_PATH =
  document.body?.dataset?.contextPath || pathPrefixBeforeAdmin;

const DB_CONFIG = {
  apiBase: `${APP_CONTEXT_PATH}/admin`,
  token: null, // JWT token after login
};

/* ───────────────────────────────────────────────────────────────
   MOCK DATA  ← Remove this entire block after DB is wired
─────────────────────────────────────────────────────────────── */
const MOCK = {
  orders: [],
  orderDetails: {},
  users: [],
  products: [],
  categories: [],
  reviews: [],
  discounts: [],
};

/* ───────────────────────────────────────────────────────────────
   API LAYER
   Replace each function body with real fetch() when DB ready
─────────────────────────────────────────────────────────────── */
const API = {
  _h() {
    return {
      "Content-Type": "application/json",
      ...(DB_CONFIG.token
        ? { Authorization: `Bearer ${DB_CONFIG.token}` }
        : {}),
    };
  },

  // ── ORDERS ──────────────────────────────────────────────────
  async getOrders() {
    const response = await fetch(`${DB_CONFIG.apiBase}/order/all`, {
      headers: this._h(),
    });
    if (!response.ok) {
      throw new Error("Không thể tải danh sách đơn hàng");
    }
    return response.json();
  },
  async getOrderById(id) {
    const response = await fetch(`${DB_CONFIG.apiBase}/order/${id}`, {
      headers: this._h(),
    });
    if (!response.ok) {
      throw new Error("Không thể tải chi tiết đơn hàng");
    }
    return response.json();
  },
  async updateOrder(id, d) {
    const response = await fetch(`${DB_CONFIG.apiBase}/order/${id}/status`, {
      method: "PUT",
      headers: this._h(),
      body: JSON.stringify(d),
    });
    if (!response.ok) {
      throw new Error("Không thể cập nhật đơn hàng");
    }
    return response.json();
  },
  async deleteOrder(id) {
    const response = await fetch(`${DB_CONFIG.apiBase}/order/${id}`, {
      method: "DELETE",
      headers: this._h(),
    });
    if (!response.ok) {
      throw new Error("Không thể xóa đơn hàng");
    }
    return true;
  },

  // ── USERS ────────────────────────────────────────────────────
  async getUsers() {
    const response = await fetch(`${DB_CONFIG.apiBase}/user/all`, {
      headers: this._h(),
    });
    if (!response.ok) {
      throw new Error("Khong the tai danh sach user");
    }
    return response.json();
  },
  async createUser(d) {
    const response = await fetch(`${DB_CONFIG.apiBase}/user/add`, {
      method: "POST",
      headers: this._h(),
      body: JSON.stringify(d),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Khong the tao user");
    }
    return response.json();
  },
  async updateUser(id, d) {
    const response = await fetch(`${DB_CONFIG.apiBase}/user/${id}`, {
      method: "PUT",
      headers: this._h(),
      body: JSON.stringify(d),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Khong the cap nhat user");
    }
    return response.json();
  },
  async deleteUser(id) {
    const response = await fetch(`${DB_CONFIG.apiBase}/user/${id}`, {
      method: "DELETE",
      headers: this._h(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Khong the xoa user");
    }
    return true;
  },

  // ── PRODUCTS ─────────────────────────────────────────────────
  async getProducts() {
    return MOCK.products;
  },
  async getProductById(id) {
    return MOCK.products.find((p) => p.id === id);
  },
  async createProduct(d) {
    console.log("CREATE PRODUCT", d);
    return { id: Date.now(), ...d };
  },
  async updateProduct(id, d) {
    console.log("UPDATE PRODUCT", id, d);
    return true;
  },
  async deleteProduct(id) {
    console.log("DELETE PRODUCT", id);
    return true;
  },

  // ── CATEGORIES ──────────────────────────────────────────────
  async getCategories() {
    return MOCK.categories;
  },
  async createCategory(d) {
    console.log("CREATE CAT", d);
    return { id: Date.now(), ...d };
  },
  async updateCategory(id, d) {
    console.log("UPDATE CAT", id, d);
    return true;
  },
  async deleteCategory(id) {
    console.log("DELETE CAT", id);
    return true;
  },

  // ── REVIEWS ─────────────────────────────────────────────────
  async getReviews() {
    return MOCK.reviews;
  },
  async deleteReview(id) {
    console.log("DELETE REVIEW", id);
    return true;
  },

  // ── DISCOUNTS ────────────────────────────────────────────────
  async getDiscounts() {
    return MOCK.discounts;
  },
  async createDiscount(d) {
    console.log("CREATE DISC", d);
    return { id: Date.now(), ...d };
  },
  async updateDiscount(id, d) {
    console.log("UPDATE DISC", id, d);
    return true;
  },
  async deleteDiscount(id) {
    console.log("DELETE DISC", id);
    return true;
  },

  // ── DASHBOARD STATS ──────────────────────────────────────────
  // Replace with: await (await fetch(`${DB_CONFIG.apiBase}/dashboard/stats`,{headers:this._h()})).json()
  async getDashboardStats() {
    const [orders, users, products, discounts] = await Promise.all([
      this.getOrders(),
      this.getUsers(),
      this.getProducts(),
      this.getDiscounts(),
    ]);
    return {
      totalRevenue: orders
        .filter((o) => o.status === "completed")
        .reduce((s, o) => s + o.total, 0),
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      activeProducts: products.filter((p) => p.stock_quantity > 0).length,
      lowStock: products.filter((p) => p.stock_quantity < 50).length,
      totalUsers: users.filter(
        (u) => String(u.role || "").toUpperCase() === "CUSTOMER",
      ).length,
      activeDiscounts: discounts.filter((d) => d.is_valid).length,
      recentOrders: orders.slice(0, 5),
      topProducts: [...products]
        .sort((a, b) => b.rating_avg - a.rating_avg)
        .slice(0, 4),
    };
  },
};

/* ───────────────────────────────────────────────────────────────
   UTILS
─────────────────────────────────────────────────────────────── */
const Utils = {
  formatCurrency(n) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);
  },

  statusBadge(s) {
    const map = {
      COMPLETED: ["badge-success", "✓ Hoàn thành"],
      PENDING: ["badge-warning", "⏳ Chờ xác nhận"],
      PENDING_CONFIRM: ["badge-info", "💳 Chờ thanh toán"],
      CONFIRMED: ["badge-purple", "✅ Đã xác nhận"],
      DELIVERED: ["badge-blue", "🚚 Đã giao hàng"],
      CANCELLED: ["badge-danger", "✗ Đã hủy"],
      DELIVERED_FAILED: ["badge-danger", "⚠ Giao thất bại"],
    };
    const [cls, lbl] = map[String(s || "").toUpperCase()] || ["badge-gray", s];
    return `<span class="badge ${cls}">${lbl}</span>`;
  },

  roleBadge(r) {
    const normalizedRole = String(r || "").toUpperCase();
    return normalizedRole === "ADMIN"
      ? `<span class="badge badge-purple">👑 Admin</span>`
      : `<span class="badge badge-info">👤 User</span>`;
  },

  userStatusBadge(s) {
    const normalizedStatus = String(s || "").toUpperCase();
    return normalizedStatus === "ACTIVE"
      ? `<span class="badge badge-success">● Active</span>`
      : `<span class="badge badge-danger">● Inactive</span>`;
  },

  validBadge(v) {
    return v
      ? `<span class="badge badge-success">✓ Valid</span>`
      : `<span class="badge badge-danger">✗ Invalid</span>`;
  },

  stars(avg) {
    const f = Math.floor(avg);
    const h = avg % 1 >= 0.5;
    const s = "★".repeat(f) + (h ? "☆" : "") + "☆".repeat(5 - f - (h ? 1 : 0));
    return `<span class="stars">${s}</span> <small style="color:var(--text-muted);font-size:11px">${avg}</small>`;
  },

  toast(msg, type = "success") {
    let c = document.getElementById("toastContainer");
    if (!c) {
      c = document.createElement("div");
      c.id = "toastContainer";
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    const t = document.createElement("div");
    const icons = { success: "✓", error: "✗", warn: "⚠" };
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type] || "✓"}</span> ${msg}`;
    c.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transition = "opacity .3s";
      setTimeout(() => t.remove(), 300);
    }, 3000);
  },

  initChartBars() {
    document.querySelectorAll(".chart-bar").forEach((b) => {
      b.style.height = "0%";
    });
  },
};

/* ───────────────────────────────────────────────────────────────
   DELETE CONFIRM — 10s countdown
─────────────────────────────────────────────────────────────── */
const DeleteConfirm = {
  _timer: null,
  _cb: null,

  show(label, onConfirm) {
    this._cb = onConfirm;
    const overlay = document.getElementById("deleteModalOverlay");
    const btn = document.getElementById("confirmDeleteBtn");
    const fill = document.getElementById("countdownFill");
    const lbl = document.getElementById("countdownLabel");
    const target = document.getElementById("deleteTargetLabel");

    if (!overlay) return;
    target.textContent = label;
    btn.disabled = true;

    fill.style.transition = "none";
    fill.style.width = "100%";
    lbl.textContent = "Vui lòng chờ 10 giây...";

    overlay.classList.add("open");

    let count = 10;
    setTimeout(() => {
      fill.style.transition = `width ${count}s linear`;
      fill.style.width = "0%";
    }, 60);

    clearInterval(this._timer);
    this._timer = setInterval(() => {
      count--;
      lbl.textContent =
        count > 0
          ? `Vui lòng chờ ${count} giây...`
          : "Bạn có thể xác nhận xóa bây giờ";
      if (count <= 0) {
        clearInterval(this._timer);
        btn.disabled = false;
      }
    }, 1000);
  },

  hide() {
    clearInterval(this._timer);
    const overlay = document.getElementById("deleteModalOverlay");
    if (overlay) overlay.classList.remove("open");
  },

  confirm() {
    if (this._cb) this._cb();
    this.hide();
  },
};

/* ───────────────────────────────────────────────────────────────
   MODAL HELPERS
─────────────────────────────────────────────────────────────── */
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("open");
    }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("open");
    }
  },
  closeAll() {
    document
      .querySelectorAll(".modal-overlay")
      .forEach((el) => el.classList.remove("open"));
  },
};

/* ───────────────────────────────────────────────────────────────
   LOGOUT / SESSION
─────────────────────────────────────────────────────────────── */
function logout() {
  if (!confirm("Bạn có chắc muốn đăng xuất?")) return;
  closeLogoutDropdown();

  fetch(`${APP_CONTEXT_PATH}/api/auth/admin/logout`, {
    method: "POST",
    credentials: "same-origin",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      localStorage.removeItem("authToken");
      Utils.toast("Đã đăng xuất thành công", "success");
      setTimeout(() => {
        window.location.href = `${APP_CONTEXT_PATH}/admin/login`;
      }, 300);
    })
    .catch(() => {
      Utils.toast("Không thể đăng xuất. Vui lòng thử lại.", "error");
    });
}

function toggleLogoutDropdown() {
  const menu = document.getElementById("logoutDropdown");
  if (!menu) return;
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function closeLogoutDropdown() {
  const menu = document.getElementById("logoutDropdown");
  if (menu) menu.style.display = "none";
}

/* ───────────────────────────────────────────────────────────────
   ACTIVE NAV LINK  — call on each page after DOMContentLoaded
─────────────────────────────────────────────────────────────── */
function setActiveNav(page) {
  document.querySelectorAll(".nav-item[data-page]").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });
}

/* ───────────────────────────────────────────────────────────────
   CLOSE MODAL ON OVERLAY CLICK
─────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && overlay.id !== "deleteModalOverlay") {
        overlay.classList.remove("open");
      }
    });
  });

  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("logoutDropdown");
    const settingsBtn = document.getElementById("settingsBtn");
    if (!dropdown || !settingsBtn) return;
    if (settingsBtn.contains(e.target) || dropdown.contains(e.target)) return;
    dropdown.style.display = "none";
  });

  Utils.initChartBars();
});
