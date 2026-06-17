package com.doan.ProFit.entity;

/**
 * =====================================================
 * Order.java – Entity Đơn Hàng (JPA)
 * =====================================================
 * MODEL/DATABASE:
 * File nay dinh nghia cau truc bang "orders" trong MySQL.
 * Spring Data JPA se tu dong tao bang dua tren annotation.
 *
 * CAC TRUONG TRONG BANG:
 * Thong tin don hang: ma don, nguoi nhan, dia chi giao hang
 * Thong tin thanh toan: phuong thuc, trang thai, ma giao dich
 * Thong tin thoi gian: ngay dat, ngay thanh toan, ngay giao, ngay hoan thanh
 *
 * QUAN HE:
 *   - Order -> User (ManyToOne): 1 don thuoc ve 1 nguoi dung
 *   - Order -> OrderItem (OneToMany): 1 don co nhieu san pham
 *
 * TRANG THAI DON HANG (status):
 *   PENDING         -> Cho xac nhan
 *   CONFIRMED       -> Da xac nhan, dang chuan bi
 *   SHIPPED         -> Dang giao
 *   DELIVERED       -> Da giao thanh cong
 *   COMPLETED       -> Hoan tat (khach xac nhan da nhan)
 *   CANCELLED       -> Da huy
 *   DELIVERED_FAILED -> Giao that bai
 *
 * TRANG THAI THANH TOAN (paymentStatus):
 *   UNPAID          -> Chua thanh toan
 *   PENDING_CONFIRM -> Da chuyen khoan, cho admin xac nhan
 *   PAID            -> Da thanh toan
 *   FAILED          -> That bai
 * =====================================================
 */

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    // =============================================
    // PRIMARY KEY
    // =============================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // AUTO_INCREMENT, bat dau tu 1

    // =============================================
    // QUAN HE VOI USER
    // =============================================
    // 1 don hang thuoc ve 1 nguoi dung (hoac khong thuoc ai - guest)
    // nullable = true vi: don guest khong co user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // =============================================
    // THONG TIN DON HANG
    // =============================================

    // Ma don hang (duy nhat, do he thong sinh)
    // Format: ORD-XXXXXXXX (8 ky tu ngau nhien)
    // VD: ORD-A3F2B1C7
    // Constraint: unique = true (khong cho phep trung ma)
    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    // Thong tin nguoi nhan hang
    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;  // Ho ten nguoi nhan

    @Column(name = "recipient_phone", nullable = false, length = 20)
    private String recipientPhone;  // So dien thoai nguoi nhan

    // Dia chi giao hang
    @Column(name = "shipping_address_line1", nullable = false, length = 255)
    private String shippingAddressLine1;  // So nha, duong, phuong/xa

    @Column(name = "shipping_city", nullable = false, length = 100)
    private String shippingCity;  // Thanh pho/tinh

    @Column(name = "shipping_province", nullable = false, length = 100)
    private String shippingProvince;  // Tinh/thanh pho (co the trung city)

    @Column(name = "shipping_country", nullable = false, length = 100)
    private String shippingCountry = "Vietnam";  // Quoc gia (mac dinh: Vietnam)

    // Ghi chu don hang (tuy chon)
    @Column(name = "note", length = 500)
    private String note;

    // =============================================
    // THONG TIN TAi CHINH
    // =============================================

    // Tong tien san pham (truoc khi cong ship/discount)
    // = SUM(lineTotal) cua tat ca OrderItem
    // precision = 15: toi da 15 chu so
    // scale = 2: 2 chu so thap phan (VD: 1,500,000.00)
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    // So tien giam gia (chua su dung, reserved for voucher system)
    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    // Phi van chuyen (chua su dung, hien tai tinh o frontend)
    @Column(name = "shipping_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    // Tong so tien phai thanh toan = subtotal - discount + shipping
    // Hien tai = subtotal (chua co discount/shipping)
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // =============================================
    // TRANG THAI
    // =============================================

    // Trang thai don hang
    // Mac dinh: "PENDING" khi tao moi
    // Gia tri: PENDING, CONFIRMED, SHIPPED, DELIVERED, COMPLETED, CANCELLED, DELIVERED_FAILED
    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    // Trang thai thanh toan
    // Mac dinh: "UNPAID"
    // Gia tri: UNPAID, PENDING_CONFIRM, PAID, FAILED
    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus = "UNPAID";

    // Phuong thuc thanh toan
    // Gia tri: COD, BANKING, VNPAY
    // Duoc set khi khach chon phuong thuc tai checkout
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // So lan thu thanh toan (neu co)
    // Su dung trong truong hop thanh toan that bai va thu lai
    @Column(name = "payment_attempts", nullable = false)
    private int paymentAttempts = 0;

    // Link anh phieu chuyen khoan (neu co, cho banking)
    @Column(name = "bank_transfer_slip", length = 500)
    private String bankTransferSlip;

    // =============================================
    // THONG TIN THOI GIAN
    // =============================================

    // Thoi gian thanh toan (set khi paymentStatus = PAID)
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // Thoi gian giao hang (set khi status = DELIVERED)
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    // Thoi gian hoan thanh (set khi status = COMPLETED)
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Thoi gian dat hang (set khi tao don, khong thay doi)
    // updatable = false: chi set 1 lan, khong cho phep sua sau
    @Column(name = "placed_at", nullable = false, updatable = false)
    private LocalDateTime placedAt = LocalDateTime.now();

    // Thoi gian tao ban ghi (tu dong boi Hibernate)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Thoi gian cap nhat ban ghi (tu dong boi Hibernate)
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =============================================
    // VNPAY FIELDS
    // =============================================
    // Luu thong tin giao dich VNPAY de doan soat

    // Ma tham chieu giao dich VNPAY
    // Format: ORD-XXXXXXXX_timestamp
    // Duoc set khi goi API tao URL thanh toan VNPAY
    @Column(name = "vnp_txn_ref", length = 100)
    private String vnpTxnRef;

    // So giao dich thuc te tu VNPAY tra ve
    // Duoc set khi IPN xac nhan thanh toan thanh cong
    @Column(name = "vnp_transaction_no", length = 50)
    private String vnpTransactionNo;

    // =============================================
    // QUAN HE: ORDER ITEMS
    // =============================================
    // 1 don hang co nhieu san pham (OrderItem)
    // CascadeType.ALL: Khi luu/xoa Order, OrderItem tu dong luu/xoa
    // orphanRemoval = true: Xoa OrderItem khi bi loai khoi danh sach
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // =============================================
    // CONSTRUCTORS
    // =============================================

    public Order() {
        // Constructor mac dinh (yeu cau boi JPA)
        // Khong lam gi ca, cac truong deu co gia tri mac dinh
    }

    // =============================================
    // GETTERS & SETTERS
    // =============================================

    // JPA can cac phuong thuc getter/setter de doc/ghi du lieu
    // Dung @Override de tu dong generate boi Lombok (neu co)
    // Day la phien ban viet tay de tranh phu thuoc Lombok

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public String getShippingAddressLine1() { return shippingAddressLine1; }
    public void setShippingAddressLine1(String shippingAddressLine1) { this.shippingAddressLine1 = shippingAddressLine1; }

    public String getShippingCity() { return shippingCity; }
    public void setShippingCity(String shippingCity) { this.shippingCity = shippingCity; }

    public String getShippingProvince() { return shippingProvince; }
    public void setShippingProvince(String shippingProvince) { this.shippingProvince = shippingProvince; }

    public String getShippingCountry() { return shippingCountry; }
    public void setShippingCountry(String shippingCountry) { this.shippingCountry = shippingCountry; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public int getPaymentAttempts() { return paymentAttempts; }
    public void setPaymentAttempts(int paymentAttempts) { this.paymentAttempts = paymentAttempts; }

    // Tang so lan thu thanh toan len 1
    public void incrementPaymentAttempts() { this.paymentAttempts++; }

    public String getBankTransferSlip() { return bankTransferSlip; }
    public void setBankTransferSlip(String bankTransferSlip) { this.bankTransferSlip = bankTransferSlip; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getVnpTxnRef() { return vnpTxnRef; }
    public void setVnpTxnRef(String vnpTxnRef) { this.vnpTxnRef = vnpTxnRef; }

    public String getVnpTransactionNo() { return vnpTransactionNo; }
    public void setVnpTransactionNo(String vnpTransactionNo) { this.vnpTransactionNo = vnpTransactionNo; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    // =============================================
    // HELPER METHODS
    // =============================================

    // Them OrderItem vao danh sach (tiện lợi cho việc build đơn)
    // Phương thức này tự động set "order" cho OrderItem
    // để duy trì quan hệ hai chiều (bidirectional)
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    // Xóa OrderItem khỏi danh sách
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}
