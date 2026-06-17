package com.doan.ProFit.dto.request;

public class OrderStatusUpdateRequest {
    private String status;
    private String paymentStatus;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
