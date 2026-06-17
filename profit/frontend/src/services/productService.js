import axios from "axios";
import { buildCategoryList, mapProductFromApi } from "../utils/productHelpers";

const API_PREFIX = "/api/v1";

export const getProductsFromApi = async (params = {}) => {
  const response = await axios.get(`${API_PREFIX}/products`, { params });
  const page = response.data || {};
  const content = Array.isArray(page.content) ? page.content : [];

  return {
    ...page,
    content,
    mappedProducts: content.map(mapProductFromApi),
  };
};

export const getCategoriesFromApi = async () => {
  const response = await axios.get(`${API_PREFIX}/categories`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getProductUiData = async (size = 200) => {
  const [productsPage, categories] = await Promise.all([
    getProductsFromApi({ page: 0, size }),
    getCategoriesFromApi(),
  ]);

  return {
    products: productsPage.mappedProducts,
    categories: buildCategoryList(categories, productsPage.mappedProducts),
  };
};
