// =====================================================
// components/CategoryCard.jsx – Card danh mục sản phẩm
// Props:
//   - category: object danh mục
//   - isActive: danh mục đang được chọn không?
//   - onClick: hàm xử lý khi click
// =====================================================

import { Store, Droplet, Zap, Flame, Pill } from "lucide-react";

const getCategoryIcon = (id, originalIcon) => {
  switch (id) {
    case 1:
      return <Store size={32} color="var(--primary)" />;
    case 2:
      return <Droplet size={32} color="var(--primary)" />;
    case 3:
      return <Zap size={32} color="var(--primary)" />;
    case 4:
      return <Flame size={32} color="var(--primary)" />;
    case 5:
      return <Pill size={32} color="var(--primary)" />;
    default:
      return originalIcon || <Store size={32} color="var(--primary)" />;
  }
};

const CategoryCard = ({ category, isActive, onClick }) => {
  return (
    <div
      className={`category-card ${isActive ? "active" : ""}`}
      onClick={() => onClick(category)}
    >
      <div className="category-icon">
        {getCategoryIcon(category.id, category.icon)}
      </div>
      <div className="category-name">{category.name}</div>
      <div className="category-count">{category.count || 0} sản phẩm</div>
    </div>
  );
};

export default CategoryCard;
