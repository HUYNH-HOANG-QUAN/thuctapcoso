// =====================================================
// utils/orderHelpers.js – Transform order data BE <-> FE
// =====================================================

/**
 * Transform BE order response to FE-compatible format.
 * Used when navigating to OrderDetailPage or displaying orders from API.
 */
export const transformOrderFromBE = (beOrder) => {
  const total = beOrder.totalAmount ?? beOrder.total;
  const safeTotal = typeof total === "number" ? total : parseFloat(total) || 0;

  return {
    id: beOrder.id,
    orderCode: beOrder.orderCode,
    recipientName: beOrder.recipientName,
    recipientPhone: beOrder.recipientPhone,
    shippingAddress: beOrder.shippingAddressLine1,
    city: beOrder.shippingCity,
    province: beOrder.shippingProvince,
    total: safeTotal,
    subtotal: safeTotal,
    shipping: 0,
    discount: 0,
    // Luu nguyen xi status UPPERCASE tu backend (PENDING, CONFIRMED, DELIVERED, COMPLETED, CANCELLED, DELIVERED_FAILED)
    // De khop voi STATUS_LABEL/STATUS_CONFIG, filter tabs, va don trong localStorage.
    status: beOrder.status || "PENDING",
    paymentStatus: beOrder.paymentStatus,
    createdAt: beOrder.placedAt || beOrder.createdAt,
    placedAt: beOrder.placedAt,
    userName: beOrder.userName,
    payMethod: beOrder.payMethod || "cod",
    items: (beOrder.items || []).map((item) => {
      const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : parseFloat(item.unitPrice) || 0;
      const lineTotal = typeof item.lineTotal === "number" ? item.lineTotal : parseFloat(item.lineTotal) || unitPrice;
      const qty = item.quantity || 1;
      return {
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: qty,
        unitPrice,
        lineTotal,
        product: {
          id: item.productId,
          name: item.productName,
          sku: item.productSku,
          price: unitPrice,
          emoji: "🏋️",
          brand: "",
        },
      };
    }),
  };
};
