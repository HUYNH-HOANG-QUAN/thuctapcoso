package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.GuestOrderRequest;
import com.doan.ProFit.dto.request.OrderRequest;
import com.doan.ProFit.dto.request.OrderStatusUpdateRequest;
import com.doan.ProFit.dto.response.OrderResponse;
import com.doan.ProFit.dto.response.DashboardStatsResponse;

import java.util.List;

public interface OrderService {
    List<OrderResponse> getAllOrders();
    OrderResponse getOrderById(Long id);
    OrderResponse createOrder(OrderRequest request, String email);
    OrderResponse createGuestOrder(GuestOrderRequest request);
    List<OrderResponse> getMyOrders(String email);
    OrderResponse updateOrderStatus(Long id, OrderStatusUpdateRequest request);
    OrderResponse markDeliveryFailed(Long id);
    OrderResponse cancelOrder(Long id, String userEmail);
    OrderResponse confirmBankingPayment(Long orderId, String userEmail);
    long countPendingConfirmOrders();
    DashboardStatsResponse getDashboardStats();
    void updateVNPayTxnRef(String orderCode, String txnRef);
    void updatePaymentSuccess(String orderCode, String transactionNo);
    void updatePaymentFailed(String orderCode);
}
