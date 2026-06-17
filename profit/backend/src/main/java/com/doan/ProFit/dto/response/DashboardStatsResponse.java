package com.doan.ProFit.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long completedOrders;
    private long pendingOrders;
    private long confirmedOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private long pendingConfirmOrders;
    private long deliveredFailedOrders;
    private long todayOrders;
    private BigDecimal todayRevenue;
    private BigDecimal monthRevenue;
    private BigDecimal yearRevenue;
    private List<RevenueByPeriod> revenueByDay;
    private List<RevenueByPeriod> revenueByMonth;
    private List<RevenueByPeriod> revenueByYear;
    private List<BestSellingProduct> bestSellingProducts;

    public static class RevenueByPeriod {
        private String period;
        private BigDecimal revenue;
        private long orderCount;

        public RevenueByPeriod() {}

        public RevenueByPeriod(String period, BigDecimal revenue, long orderCount) {
            this.period = period;
            this.revenue = revenue;
            this.orderCount = orderCount;
        }

        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        public long getOrderCount() { return orderCount; }
        public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
    }

    public static class BestSellingProduct {
        private Long productId;
        private String productName;
        private long totalSold;
        private BigDecimal totalRevenue;

        public BestSellingProduct() {}

        public BestSellingProduct(Long productId, String productName, long totalSold, BigDecimal totalRevenue) {
            this.productId = productId;
            this.productName = productName;
            this.totalSold = totalSold;
            this.totalRevenue = totalRevenue;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public long getTotalSold() { return totalSold; }
        public void setTotalSold(long totalSold) { this.totalSold = totalSold; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    }

    public DashboardStatsResponse() {}

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public long getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(long completedOrders) { this.completedOrders = completedOrders; }
    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
    public long getConfirmedOrders() { return confirmedOrders; }
    public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }
    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }
    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }
    public long getPendingConfirmOrders() { return pendingConfirmOrders; }
    public void setPendingConfirmOrders(long pendingConfirmOrders) { this.pendingConfirmOrders = pendingConfirmOrders; }
    public long getDeliveredFailedOrders() { return deliveredFailedOrders; }
    public void setDeliveredFailedOrders(long deliveredFailedOrders) { this.deliveredFailedOrders = deliveredFailedOrders; }
    public long getTodayOrders() { return todayOrders; }
    public void setTodayOrders(long todayOrders) { this.todayOrders = todayOrders; }
    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }
    public BigDecimal getMonthRevenue() { return monthRevenue; }
    public void setMonthRevenue(BigDecimal monthRevenue) { this.monthRevenue = monthRevenue; }
    public BigDecimal getYearRevenue() { return yearRevenue; }
    public void setYearRevenue(BigDecimal yearRevenue) { this.yearRevenue = yearRevenue; }
    public List<RevenueByPeriod> getRevenueByDay() { return revenueByDay; }
    public void setRevenueByDay(List<RevenueByPeriod> revenueByDay) { this.revenueByDay = revenueByDay; }
    public List<RevenueByPeriod> getRevenueByMonth() { return revenueByMonth; }
    public void setRevenueByMonth(List<RevenueByPeriod> revenueByMonth) { this.revenueByMonth = revenueByMonth; }
    public List<RevenueByPeriod> getRevenueByYear() { return revenueByYear; }
    public void setRevenueByYear(List<RevenueByPeriod> revenueByYear) { this.revenueByYear = revenueByYear; }
    public List<BestSellingProduct> getBestSellingProducts() { return bestSellingProducts; }
    public void setBestSellingProducts(List<BestSellingProduct> bestSellingProducts) { this.bestSellingProducts = bestSellingProducts; }
}
