import ProductListPage from "./ProductListPage";

const ProductsPage = ({ onAddToCart, onViewDetail }) => {
  return (
    <ProductListPage onAddToCart={onAddToCart} onViewDetail={onViewDetail} />
  );
};

export default ProductsPage;
