package com.doan.ProFit.entity;

/**
 * =====================================================
 * OrderItem.java – Entity Chi Tiết Sản Phẩm Trong Đơn Hàng (JPA)
 * =====================================================
 * MODEL/DATABASE:
 * File nay dinh nghia cau truc bang "order_items" trong MySQL.
 * Moi ban ghi = 1 san pham trong 1 don hang cu the.
 *
 * VI DU:
 *   Don hang ORD-A3F2B1C7 co 2 san pham:
 *     - Whey Protein 2.27kg x 1 = 1,200,000 VND
 *     - Creatine x 2 = 600,000 VND
 *   -> Tao 2 ban ghi trong bang order_items
 *
 * DAC DIEM QUAN TRONG - SNAPSHOT:
 *   Cac truong productName, productSku, unitPrice duoc LUU SNAPSHOT
 *   ngay thoi diem dat hang, khong phai tham chieu.
 *   Dieu nay dam bao rang:
 *     - Don hang khong bi anh huong khi san pham doi ten, doi gia
 *     - Don hang hien thi dung thong tin tai thoi diem dat
 *
 * QUAN HE:
 *   - OrderItem -> Order (ManyToOne): Chi tiet thuoc ve 1 don hang
 *   - OrderItem -> Product (ManyToOne): Chi tiet lien ket 1 san pham
 * =====================================================
 */

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    // =============================================
    // PRIMARY KEY
    // =============================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // AUTO_INCREMENT

    // =============================================
    // QUAN HE VOI ORDER
    // =============================================
    // Moi chi tiet don hang thuoc ve 1 don hang
    // JoinColumn: tao cot "order_id" trong bang order_items
    // nullable = false: 1 OrderItem bat buoc phai thuoc 1 Order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // =============================================
    // QUAN HE VOI PRODUCT
    // =============================================
    // Moi chi tiet don hang lien ket 1 san pham
    // JoinColumn: tao cot "product_id" trong bang order_items
    // nullable = false: phai co san pham
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // =============================================
    // SNAPSHOT: Thong tin san pham tai thoi diem dat hang
    // =============================================
    // QUAN TRONG: Day la SNAPSHOT, khong phai tham chieu!
    // Khi san pham thay doi ten, SKU, gia...
    // Don hang van hien thi dung thong tin tai thoi diem dat.
    //
    // LUU Y:
    //   - Neu san pham bi XOA khoi he thong, OrderItem van con
    //     thong tin ve ten, SKU, gia tai thoi diem dat.
    //   - Day la thiet ke co y (intentional design) de dam bao
    //     tinh toan ven cua don hang.

    // Ten san pham tai thoi diem dat (VD: "Whey Protein 2.27kg - Chocolate")
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    // SKU (Stock Keeping Unit) tai thoi diem dat
    // VD: "WHEY-CHOC-2270"
    @Column(name = "product_sku", nullable = false, length = 50)
    private String productSku;

    // =============================================
    // THONG TIN SO LUONG & GIA
    // =============================================

    // So luong san pham dat mua
    @Column(nullable = false)
    private Integer quantity;

    // Don gia tai thoi diem dat (VND)
    // Gia nay la gia CO DINH tai thoi diem dat,
    // khong thay doi theo gia hien tai cua san pham.
    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    // Thanh tien = So luong x Don gia
    // VD: 2 x 600,000 = 1,200,000 VND
    @Column(name = "line_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    // =============================================
    // CONSTRUCTORS
    // =============================================

    public OrderItem() {
        // Constructor mac dinh (yeu cau boi JPA)
    }

    // =============================================
    // GETTERS & SETTERS
    // =============================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
}
