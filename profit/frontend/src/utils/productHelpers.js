import { API_BASE_URL } from "../services/apiConfig";

export const formatPrice = (price) => {
  const safePrice = Number(price) || 0;
  // Format số với dấu chấm phân cách hàng nghìn
  const formatted = safePrice
    .toFixed(0)  // bỏ phần thập phân
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}đ`;
};

export const renderStars = (rating) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
};

const pickProductImageByCategory = (categoryName = "") => {
  const normalized = categoryName.toLowerCase();

  if (normalized.includes("whey")) return "/images/whey/whey-default.png";
  if (normalized.includes("creatine") || normalized.includes("creatin"))
    return "/images/creatin/creatin-default.png";
  if (normalized.includes("pre"))
    return "/images/pre-workout/pre-workout-default.png";
  if (normalized.includes("vitamin") || normalized.includes("bcaa"))
    return "/images/vitamin/vitamin-default.png";
  if (normalized.includes("meal") || normalized.includes("replacement"))
    return "/images/meal-replacement/meal-default.png";
  if (normalized.includes("bar") || normalized.includes("cookie"))
    return "/images/protein-bars/bars-default.png";

  return "/images/banners/banner-default.png";
};

const getPreferredImageUrl = (imageUrl = "") => {
  if (!imageUrl) return imageUrl;

  // Prefer larger source when provider exposes thumbnail variants.
  const upgradedPath = imageUrl
    .replace("/small/", "/large/")
    .replace("/thumb/", "/large/")
    .replace("/thumbnail/", "/large/")
    .replace("/medium/", "/large/")
    .replace("/resized/", "/large/");

  try {
    const url = new URL(upgradedPath);
    ["w", "width", "h", "height"].forEach((key) => {
      if (url.searchParams.has(key)) url.searchParams.set(key, "1200");
    });
    return url.toString();
  } catch {
    return upgradedPath;
  }
};

const buildSizedImageUrl = (imageUrl = "", width) => {
  if (!imageUrl) return "";

  let changed = false;
  let upgraded = imageUrl
    .replace(/\/(?:small|thumb|thumbnail|medium|resized)\//g, () => {
      changed = true;
      return "/large/";
    })
    .replace(/([,/])w_\d+/g, (_, prefix) => {
      changed = true;
      return `${prefix}w_${width}`;
    })
    .replace(/([,/])h_\d+/g, (_, prefix) => {
      changed = true;
      return `${prefix}h_${width}`;
    });

  try {
    const isAbsolute = /^https?:\/\//i.test(upgraded);
    const url = new URL(upgraded, "http://profit.local");
    ["w", "width", "h", "height"].forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, String(width));
        changed = true;
      }
    });

    if (!changed) return "";
    return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return changed ? upgraded : "";
  }
};

const buildImageSrcSet = (imageUrl = "") => {
  const candidates = [600, 900, 1200]
    .map((width) => {
      const sizedUrl = buildSizedImageUrl(imageUrl, width);
      return sizedUrl ? `${sizedUrl} ${width}w` : "";
    })
    .filter(Boolean);

  return candidates.length > 0 ? candidates.join(", ") : "";
};

export const mapProductFromApi = (item) => {
  const price = Number(item?.price ?? 0);
  const oldPriceRaw = item?.oldPrice == null ? null : Number(item.oldPrice);
  const oldPrice = oldPriceRaw && oldPriceRaw > price ? oldPriceRaw : null;
  const ratingAvg = Number(item?.ratingAvg ?? 0);
  const ratingCount = Number(item?.ratingCount ?? 0);
  const stockQuantity = Number(item?.stockQuantity ?? 0);
  const rawImageUrl = item?.imageUrl?.trim();
  const fallbackImage = rawImageUrl || pickProductImageByCategory(item?.categoryName);
  const preferredImage = getPreferredImageUrl(rawImageUrl) || fallbackImage;

  const formatImageUrl = (url) => {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
      const cleanPath = url.startsWith("/") ? url : `/${url}`;
      return `${API_BASE_URL}${cleanPath}`;
    }
    return url;
  };

  return {
    id: item?.id,
    slug: item?.slug || "",
    sku: item?.sku || "",
    name: item?.name || "Sản phẩm",
    brand: item?.sku ? item.sku.split("-")[0] : "ProFit",
    shortDesc: item?.shortDescription || "",
    fullDesc: item?.description || item?.shortDescription || "",
    image: formatImageUrl(preferredImage),
    imageSrcSet: buildImageSrcSet(formatImageUrl(rawImageUrl)),
    imageFallback: formatImageUrl(fallbackImage),
    price,
    oldPrice,
    rating: Math.round(ratingAvg),
    reviews: ratingCount,
    badge: oldPrice ? "SALE" : "",
    categoryId: item?.categoryId,
    categoryName: item?.categoryName || "Khác",
    tags: Array.isArray(item?.tags) ? item.tags : [],
    inStock: stockQuantity > 0,
    stockQuantity,
    isActive: Boolean(item?.isActive),
    flavors: ["Mặc định"],
    weight: "Đang cập nhật",
    servings: 1,
  };
};

export const buildCategoryList = (
  categoriesFromApi = [],
  mappedProducts = [],
) => {
  const countByCategory = mappedProducts.reduce((acc, product) => {
    const key = product.categoryId;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const dynamicCategories = categoriesFromApi.map((category) => ({
    id: category.id,
    name: category.name,
    count: countByCategory[category.id] || 0,
    icon: "",
  }));

  return [
    {
      id: 0,
      name: "Tất cả",
      count: mappedProducts.length,
      icon: "",
    },
    ...dynamicCategories,
  ];
};
