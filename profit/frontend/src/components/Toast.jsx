// =====================================================
// components/Toast.jsx – Thông báo nổi góc phải
// Props:
//   - message: nội dung thông báo
//   - visible: hiện hay ẩn
// =====================================================

const Toast = ({ message, visible }) => {
  return (
    <div className={`toast ${visible ? "show" : ""}`}>
      {message}
    </div>
  );
};

export default Toast;
