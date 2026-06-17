// =====================================================
// ProfilePage.jsx – Trang quản lý thông tin cá nhân, lưu vào localStorage
// Props: navigate
// =====================================================

import { useEffect, useState } from "react";

const DEFAULT_USER_INFO = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  district: "",
  city: "",
  note: "",
};

const ProfilePage = ({ navigate, user, showToast }) => {
  const [form, setForm] = useState(DEFAULT_USER_INFO);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const storageKey = user ? `userInfo_${user.email}` : "userInfo";
      const savedInfo = localStorage.getItem(storageKey);
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setForm({
          ...DEFAULT_USER_INFO,
          ...parsed,
        });
      } else if (user) {
        // Nếu chưa lưu lần nào nhưng đã có thông tin user từ login/register
        setForm({
          ...DEFAULT_USER_INFO,
          fullName: user.name || "",
          email: user.email || "",
          phone: user.phone || ""
        });
      }
    } catch (error) {
      console.error("Không đọc được thông tin người dùng:", error);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      showToast("Vui lòng nhập đầy đủ họ tên, số điện thoại, địa chỉ và tỉnh/thành phố.");
      return;
    }

    const storageKey = user ? `userInfo_${user.email}` : "userInfo";
    localStorage.setItem(storageKey, JSON.stringify(form));
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div>
      <div className="page-hero">
        <h1>
          THÔNG TIN <span>CÁ NHÂN</span>
        </h1>
        <p>Lưu thông tin để lần sau đặt hàng không cần nhập lại</p>
      </div>

      <section className="section">
        <div className="checkout-card" style={{ maxWidth: 860, margin: "0 auto" }}>
          <h3 className="checkout-card-title">👤 Hồ sơ giao hàng</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                className="form-input"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                className="form-input"
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ *</label>
            <input
              className="form-input"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quận / Huyện</label>
              <input
                className="form-input"
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tỉnh / Thành phố *</label>
              <input
                className="form-input"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ghi chú mặc định</label>
            <textarea
              className="form-input form-textarea"
              name="note"
              value={form.note}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <button className="btn-primary" onClick={handleSave}>
              Lưu thông tin
            </button>

            <button className="btn-outline" onClick={() => navigate("checkout")}>
              Sang thanh toán
            </button>

            <button className="btn-outline" onClick={() => navigate("home")}>
              Về trang chủ
            </button>
          </div>

          {saved && (
            <div style={{ marginTop: 16, color: "var(--green)", fontSize: 14, fontWeight: 600 }}>
              ✅ Đã lưu thông tin thành công
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;