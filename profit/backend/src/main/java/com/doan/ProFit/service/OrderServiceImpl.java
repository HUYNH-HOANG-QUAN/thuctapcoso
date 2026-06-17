package com.doan.ProFit.service;

/**
 * =====================================================
 * OrderServiceImpl.java – Implement Logic Nghiệp Vụ Đơn Hàng
 * =====================================================
 * DAY LA FILE QUAN TRONG NHAT - CHUA TOAN BO LOGIC NGHIEP VU
 *
 * LUONG HOAT DONG CHINH:
 *
 *   1. TAO DON HANG (createOrder / createGuestOrder)
 *      -> Sinh ma don ORD-XXXXXXXX
 *      -> Tinh tong tien tu cac OrderItem
 *      -> Luu vao DB
 *
 *   2. XU LY THANH TOAN
 *      -> Banking: UNPAID -> PENDING_CONFIRM (confirmBankingPayment)
 *      -> VNPAY:    UNPAID -> PAID + CONFIRMED (updatePaymentSuccess)
 *                   UNPAID -> FAILED (updatePaymentFailed)
 *
 *   3. CAP NHAT TRANG THAI (Admin)
 *      -> CONFIRMED -> SHIPPED -> DELIVERED -> COMPLETED
 *      -> REDUCESTOCK: Tru kho khi COMPLETED
 *
 *   4. HUY DON (khach tu huy / admin huy)
 *      -> CANCELLED hoac DELIVERED_FAILED
 *      -> RESTORESTOCK: Hoan kho
 *
 *   5. GIAO THAT BAI (Admin)
 *      -> DELIVERED_FAILED
 *      -> RESTORESTOCK: Hoan kho
 *
 * NGUYEN TAC QUAN LI KHO (STOCK MANAGEMENT):
 *   - KHONG tru kho ngay khi dat hang (chi tru khi giao thanh cong)
 *   - HOAN lai kho khi: huy don, giao that bai
 *   - DAC DIEM NAY giup tranh tinh trang "kho am" khi khach dat nhieu ma chua thanh toan
 *
 * =====================================================
 */

import com.doan.ProFit.dto.request.GuestOrderRequest;
import com.doan.ProFit.dto.request.OrderItemRequest;
import com.doan.ProFit.dto.request.OrderRequest;
import com.doan.ProFit.dto.request.OrderStatusUpdateRequest;
import com.doan.ProFit.dto.response.DashboardStatsResponse;
import com.doan.ProFit.dto.response.DashboardStatsResponse.BestSellingProduct;
import com.doan.ProFit.dto.response.DashboardStatsResponse.RevenueByPeriod;
import com.doan.ProFit.dto.response.OrderItemResponse;
import com.doan.ProFit.dto.response.OrderResponse;
import com.doan.ProFit.entity.Order;
import com.doan.ProFit.entity.OrderItem;
import com.doan.ProFit.entity.Product;
import com.doan.ProFit.entity.User;
import com.doan.ProFit.repository.OrderRepository;
import com.doan.ProFit.repository.ProductRepository;
import com.doan.ProFit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    // =============================================
    // DEPENDENCY INJECTION
    // =============================================
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // =============================================
    // LAY DANH SACH & CHI TIET DON HANG
    // =============================================

    /**
     * Lay tat ca don hang (admin)
     * @return Danh sach don hang, sort theo thoi gian giam dan
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lay chi tiet don hang theo ID
     * @param id - ID don hang
     * @return Chi tiet don hang
     * @throws IllegalArgumentException - Don khong ton tai
     */
    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return mapToResponse(order);
    }

    /**
     * Lay danh sach don hang cua mot user
     * @param email - Email nguoi dung
     * @return Danh sach don hang cua user do
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String email) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =============================================
    // TAO DON HANG - USER DA DANG NHAP
    // =============================================
    /**
     * Tao don hang cho nguoi da dang nhap
     *
     * LUONG XU LY:
     *   1. Tim user trong DB bang email (tu JWT)
     *   2. Tao object Order moi
     *   3. Sinh ma don: "ORD-" + 8 ky tu UUID ngau nhien
     *      VD: ORD-A3F2B1C7
     *   4. Gan thong tin giao hang
     *   5. Duyet tung item trong request:
     *      - Tim Product trong DB
     *      - Tao OrderItem: productName, SKU, quantity, unitPrice, lineTotal
     *      - Tinh lineTotal = unitPrice * quantity
     *      - Cong don vao totalAmount
     *   6. Luu Order (cascade se tu dong luu OrderItem)
     *   7. Tra ve OrderResponse
     *
     * LUU Y VE GIA TRI MAC DINH:
     *   - status = "PENDING"
     *   - paymentStatus = "UNPAID"
     *   - subtotal = tong tien san pham (CHUA co shipping/discount)
     *   - totalAmount = subtotal (vi chua co shipping/discount)
     */
    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String email) {
        // BUOC 1: Tim user trong DB
        User user = userRepository.findByEmailOrPhone(email, email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // BUOC 2: Tao Order
        Order order = new Order();
        order.setUser(user);  // Lien ket don voi user

        // BUOC 3: Sinh ma don
        // Su dung 8 ky tu dau cua UUID ngau nhien -> duy nhat va ngan gon
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        // BUOC 4: Gan thong tin giao hang
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setShippingAddressLine1(request.getShippingAddressLine1());
        order.setShippingCity(request.getShippingCity());
        order.setShippingProvince(request.getShippingProvince());
        order.setNote(request.getNote());

        // BUOC 5: Duyet items va tinh tong tien
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            // Tim san pham trong DB
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                        "Product not found: " + itemReq.getProductId()
                    ));

            // Tao OrderItem (snapshot)
            OrderItem item = new OrderItem();
            item.setOrder(order);                 // Lien ket voi don
            item.setProduct(product);              // Tham chieu den san pham
            item.setProductName(product.getName()); // SNAPSHOT: ten tai thoi diem dat
            item.setProductSku(product.getSku());   // SNAPSHOT: SKU tai thoi diem dat
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(product.getPrice());  // SNAPSHOT: gia tai thoi diem dat

            // Tinh thanh tien = don gia * so luong
            item.setLineTotal(
                product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()))
            );

            // Them item vao don (bidirectional relationship)
            order.getItems().add(item);

            // Cong don vao tong
            total = total.add(item.getLineTotal());
        }

        // BUOC 6: Tinh toan tai chinh
        order.setSubtotal(total);
        order.setTotalAmount(total);  // Hien tai = subtotal (chua co shipping/discount)

        // BUOC 7: Luu va tra ve
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    // =============================================
    // TAO DON HANG - GUEST (KHACH VANG LAI)
    // =============================================
    /**
     * Tao don hang cho khach vang lai (khong can dang nhap)
     *
     * LUONG XU LY:
     *   Giong nhu createOrder, nhung thay vi tim user tu JWT:
     *   - Tim user noi bo: __guest__@system.internal
     *   - Don guest van duoc luu vao DB nhung khong lien ket tai khoan
     *
     * DAC DIEM:
     *   - Khach hang khong the theo doi don qua trang "Don hang cua toi"
     *   - Don duoc luu trong localStorage frontend (key: localOrders)
     *   - Khach co the huy don neu co ma don (gui kem khi tao)
     */
    @Override
    @Transactional
    public OrderResponse createGuestOrder(GuestOrderRequest request) {
        // Tim user noi bo cho guest
        // User nay duoc tao san trong DB khi khoi tao he thong
        // Email: __guest__@system.internal
        User guestUser = userRepository.findByEmail("__guest__@system.internal")
                .orElseThrow(() -> new IllegalStateException(
                    "Guest user not found. Please restart the application."
                ));

        // Tao Order (cac buoc giong createOrder)
        Order order = new Order();
        order.setUser(guestUser);
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setShippingAddressLine1(request.getShippingAddressLine1());
        order.setShippingCity(request.getShippingCity());
        // Province = city neu khong co gia tri rieng
        order.setShippingProvince(
            request.getShippingProvince() != null ? request.getShippingProvince() : request.getShippingCity()
        );
        order.setNote(request.getNote());

        // Tinh tong tien (giong createOrder)
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                        "Product not found: " + itemReq.getProductId()
                    ));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setProductSku(product.getSku());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(product.getPrice());
            item.setLineTotal(
                product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()))
            );

            order.getItems().add(item);
            total = total.add(item.getLineTotal());
        }

        order.setSubtotal(total);
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    // =============================================
    // CAP NHAT TRANG THAI (ADMIN)
    // =============================================
    /**
     * Cap nhat trang thai don hang (admin)
     *
     * LUONG XU LY:
     *   1. Tim don trong DB
     *   2. Kiem tra tinh hop le cua chuyen trang thai
     *   3. Neu status = COMPLETED -> goi reduceStock() de tru kho
     *   4. Neu status = CANCELLED hoac DELIVERED_FAILED -> goi restoreStock() de hoan kho
     *   5. Neu paymentStatus = PAID -> tu dong doi status = CONFIRMED
     *   6. Luu va tra ve
     *
     * CAC QUY TAC:
     *   - Khong the huy don da giao (DELIVERED) hoac hoan thanh (COMPLETED)
     *   - COMPLETED se tu dong tru stock
     *   - CANCELLED se tu dong hoan stock
     *   - DELIVERED_FAILED se tu dong hoan stock
     */
    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatusUpdateRequest request) {
        return updateOrderStatusInternal(id, request, true);
    }

    /**
     * Ham internal xu ly logic cap nhat trang thai
     */
    private OrderResponse updateOrderStatusInternal(
            Long id,
            OrderStatusUpdateRequest request,
            boolean adminOverride) {

        // BUOC 1: Tim don
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String oldStatus = order.getStatus();
        String oldPaymentStatus = order.getPaymentStatus();

        // BUOC 2: Xu ly cap nhat STATUS
        if (request.getStatus() != null) {
            String targetStatus = request.getStatus();

            // Khong cho phep set trang thai DELIVERED_FAILED bang cach thuong
            // Phai dung ham markDeliveryFailed()
            if ("DELIVERED_FAILED".equals(targetStatus)) {
                throw new IllegalArgumentException(
                    "Vui lòng sử dụng chức năng 'Giao thất bại' để đánh dấu giao hàng thất bại"
                );
            }

            // Kiem tra huy don
            if ("CANCELLED".equals(targetStatus)) {
                // Khong the huy don da giao/hoan thanh/that bai
                if ("DELIVERED".equals(oldStatus) || "COMPLETED".equals(oldStatus) || "DELIVERED_FAILED".equals(oldStatus)) {
                    throw new IllegalArgumentException(
                        "Không thể hủy đơn đã giao hoặc đã hoàn thành"
                    );
                }
                // Neu don dang cho xac nhan thanh toan -> tra payment ve UNPAID
                if (!"CANCELLED".equals(oldStatus)) {
                    restoreStock(order);  // Hoan kho
                }
                if ("PENDING_CONFIRM".equals(oldPaymentStatus)) {
                    order.setPaymentStatus("UNPAID");
                }
            }

            // Cap nhat trang thai moi
            order.setStatus(request.getStatus());

            // BUOC 3: Set timestamps tuong ung voi trang thai
            // - DELIVERED -> set deliveredAt (dung cho thong ke doanh thu theo thoi gian)
            // - COMPLETED -> set completedAt (trang thai ket thuc, tru kho)
            if ("DELIVERED".equals(targetStatus)) {
                order.setDeliveredAt(LocalDateTime.now());
            } else if ("COMPLETED".equals(targetStatus)) {
                order.setCompletedAt(LocalDateTime.now());
                reduceStock(order);  // TRU KHO: San pham da ban
            }
        }

        // BUOC 4: Xu ly cap nhat PAYMENT STATUS
        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());

            // Khi thanh toan thanh cong (PAID) -> tu dong xac nhan don
            if ("PAID".equals(request.getPaymentStatus())) {
                order.setStatus("CONFIRMED");
                if (order.getPaidAt() == null) {
                    order.setPaidAt(LocalDateTime.now());
                }
            }
        }

        // BUOC 5: Luu va tra ve
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    // =============================================
    // DANH DAU GIAO THAT BAI
    // =============================================
    /**
     * Danh dau giao hang that bai (admin)
     *
     * LUONG XU LY:
     *   1. Kiem tra don dang o trang thai cho phep
     *      (CONFIRMED hoac DELIVERED)
     *   2. Doi status -> DELIVERED_FAILED
     *   3. Xoa completedAt (neu co)
     *   4. Hoan kho (restoreStock)
     *
     * SU DUNG:
     *   Khi don hang duoc giao nhung:
     *   - Khach hang tu choi nhan
     *   - Dia chi giao khong dung
     *   - Khong lien lac duoc voi khach
     */
    @Override
    @Transactional
    public OrderResponse markDeliveryFailed(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String oldStatus = order.getStatus();

        // Chỉ cho phép giao thất bại khi đơn đang ở CONFIRMED hoặc DELIVERED
        // Nếu PENDING: chưa giao, không gọi là "giao thất bại"
        // Nếu CANCELLED/COMPLETED: đã xử lý xong rồi
        if (!"CONFIRMED".equals(oldStatus) && !"DELIVERED".equals(oldStatus)) {
            throw new IllegalArgumentException(
                "Không thể đánh dấu giao thất bại: đơn hàng phải đang ở trạng thái 'Đã xác nhận' hoặc 'Đã giao hàng'"
            );
        }

        // Cap nhat trang thai
        order.setStatus("DELIVERED_FAILED");
        order.setCompletedAt(null);  // Xoa thoi gian hoan thanh
        order.setDeliveredAt(null);  // Xoa thoi gian giao (vi khong con giao thanh cong nua)

        // Hoan kho vi san pham chua duoc giao
        restoreStock(order);

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    // =============================================
    // HUY DON (USER TU HUY)
    // =============================================
    /**
     * Khach hang tu huy don hang
     *
     * LUONG XU LY:
     *   1. Kiem tra don ton tai
     *   2. Kiem tra quyen so huu (user hoac guest)
     *   3. Kiem tra trang thai cho phep huy (PENDING hoac PENDING_CONFIRM)
     *   4. Cap nhat status = CANCELLED
     *   5. Neu PENDING_CONFIRM -> tra paymentStatus ve UNPAID
     *
     * HAN CHE:
     *   - Chi cho phep huy don PENDING (cho xac nhan)
     *   - Khong cho phep huy don da xac nhan/da giao
     */
    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Kiem tra quyen so huu
        // User da dang nhap: email phai khop voi email trong don
        // Guest: email __guest__@system.internal
        boolean isOwner = order.getUser() != null && userEmail.equals(order.getUser().getEmail());
        boolean isGuest = order.getUser() != null && "__guest__@system.internal".equals(order.getUser().getEmail());
        if (!isOwner && !isGuest) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đơn hàng này");
        }

        String oldStatus = order.getStatus();
        String oldPaymentStatus = order.getPaymentStatus();

        // Chi cho phep huy khi:
        //   - status = PENDING (cho xac nhan)
        //   - paymentStatus = PENDING_CONFIRM (da chuyen khoan, cho admin xac nhan)
        if (!"PENDING".equals(oldStatus) && !"PENDING_CONFIRM".equals(oldPaymentStatus)) {
            throw new IllegalArgumentException("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
        }

        // Neu dang cho xac nhan thanh toan banking -> tra ve UNPAID
        if ("PENDING_CONFIRM".equals(oldPaymentStatus)) {
            order.setPaymentStatus("UNPAID");
        }

        // Cap nhat trang thai
        order.setStatus("CANCELLED");
        order.setCompletedAt(null);

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    // =============================================
    // QUAN LY KHO HANG
    // =============================================

    /**
     * TRU KHO - Gọi khi đơn hàng hoàn thành (COMPLETED)
     *
     * NGUYEN TAC:
     *   Khi khach hang xac nhan da nhan hang (status = COMPLETED),
     *   san pham da ban -> can tru khoi kho.
     *
     * LUONG XU LY:
     *   Duyet tung item trong don:
     *     - Lay product trong DB
     *     - stockQuantity -= quantity
     *     - Luu product
     *
     * LUU Y:
     *   - Math.max(0, newStock): dam bao kho khong am
     *   - Chỉ trừ khi status = COMPLETED (khong phai PENDING)
     *   - VD: Dat 3 san pham, huy don -> khong tru kho
     */
    @Transactional
    private void reduceStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = productRepository.findById(item.getProduct().getId()).orElse(null);
                if (product != null) {
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    int orderedQty = item.getQuantity() != null ? item.getQuantity() : 0;
                    int newStock = currentStock - orderedQty;
                    // Dam bao khong am: neu ordered > stock -> set = 0
                    product.setStockQuantity(Math.max(0, newStock));
                    productRepository.save(product);
                }
            }
        }
    }

    /**
     * HOAN KHO - Goị khi đơn bị hủy hoặc giao thất bại
     *
     * NGUYEN TAC:
     *   Khi don bi huy hoac giao that bai,
     *   san pham tra ve kho -> can cong lai.
     *
     * LUONG XU LY:
     *   Duyet tung item trong don:
     *     - Lay product trong DB
     *     - stockQuantity += quantity
     *     - Luu product
     *
     * GOI TRONG:
     *   - cancelOrder(): khi khach tu huy
     *   - updateOrderStatusInternal(): khi admin huy
     *   - markDeliveryFailed(): khi giao that bai
     */
    @Transactional
    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = productRepository.findById(item.getProduct().getId()).orElse(null);
                if (product != null) {
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    int orderedQty = item.getQuantity() != null ? item.getQuantity() : 0;
                    product.setStockQuantity(currentStock + orderedQty);
                    productRepository.save(product);
                }
            }
        }
    }

    // =============================================
    // XAC NHAN THANH TOAN BANKING
    // =============================================
    /**
     * Xac nhan thanh toan chuyen khoan ngan hang
     *
     * GOI BOI: BankingPaymentController.confirmBankingPayment()
     * KHI:     Khach hang nhan nut "Da thanh toan" sau khi chuyen khoan
     *
     * LUONG XU LY:
     *   1. Tim don hang
     *   2. Kiem tra quyen (chu don hoac guest)
     *   3. Kiem tra paymentStatus = UNPAID (chua xac nhan)
     *   4. Cap nhat:
     *      - paymentMethod = "BANKING"
     *      - paymentStatus = "PENDING_CONFIRM"
     *      - paidAt = thoi gian hien tai
     *
     * SAU NAY:
     *   Admin se kiem tra tai khoan BIDV de xac nhan.
     *   Neu so tien khop, admin se cap nhat:
     *   - paymentStatus = PAID
     *   - status = CONFIRMED
     */
    @Override
    @Transactional
    public OrderResponse confirmBankingPayment(Long orderId, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Kiem tra quyen so huu
        boolean isOwner = order.getUser() != null && userEmail.equals(order.getUser().getEmail());
        boolean isGuestOrder = order.getUser() != null && "__guest__@system.internal".equals(order.getUser().getEmail());

        if (!isOwner && !isGuestOrder) {
            throw new IllegalArgumentException("Bạn không có quyền xác nhận đơn hàng này");
        }

        // Chi xac nhan neu chua thanh toan
        if (!"UNPAID".equals(order.getPaymentStatus())) {
            throw new IllegalArgumentException("Đơn hàng không ở trạng thái chờ thanh toán");
        }

        // Cap nhat trang thai
        order.setPaymentMethod("BANKING");
        order.setPaymentStatus("PENDING_CONFIRM");
        order.setPaidAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    /**
     * Dem so don cho xac nhan thanh toan banking
     */
    @Override
    @Transactional(readOnly = true)
    public long countPendingConfirmOrders() {
        return orderRepository.countByPaymentStatus("PENDING_CONFIRM");
    }

    // =============================================
    // XU LY THANH TOAN VNPAY
    // =============================================

    /**
     * Luu ma giao dich VNPAY (txnRef) vao don
     *
     * GOI BOI: VNPayController.createPayment()
     * KHI:     Tao URL thanh toan VNPAY thanh cong
     *
     * LUU Y:
     *   txnRef = orderCode + "_" + timestamp
     *   VD: ORD-A3F2B1C7_1718294000
     *   txnRef duoc dung de doan soat khi IPN callback
     */
    @Override
    @Transactional
    public void updateVNPayTxnRef(String orderCode, String txnRef) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderCode));
        order.setVnpTxnRef(txnRef);
        order.setPaymentMethod("VNPAY");  // Danh dau phuong thuc VNPAY
        orderRepository.save(order);
    }

    /**
     * Cap nhat thanh toan thanh cong (IPN VNPAY)
     *
     * GOI BOI: VNPayController.handleIpn()
     * KHI:     VNPAY goi IPN xac nhan thanh toan thanh cong
     *
     * LUONG:
     *   1. paymentStatus = "PAID"
     *   2. status = "CONFIRMED" (tu dong xac nhan don)
     *   3. vnpTransactionNo = ma giao dich VNPAY
     *   4. paidAt = thoi gian hien tai
     *
     * DAC DIEM:
     *   - IPN la server-to-server, khong phu thuoc trinh duyet
     *   - Neu user tat tab truoc khi redirect -> IPN van chay
     *   - Don tu dong xac nhan ngay khi thanh toan thanh cong
     */
    @Override
    @Transactional
    public void updatePaymentSuccess(String orderCode, String transactionNo) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderCode));
        order.setPaymentStatus("PAID");
        order.setStatus("CONFIRMED");         // Tu dong xac nhan
        order.setVnpTransactionNo(transactionNo);  // Ma giao dich VNPAY
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    /**
     * Cap nhat thanh toan that bai (IPN VNPAY)
     *
     * GOI BOI: VNPayController.handleIpn()
     * KHI:     VNPAY goi IPN thong bao that bai
     *
     * LUONG:
     *   - paymentStatus = "FAILED"
     *
     * DAC DIEM:
     *   - Khong thay doi status (van la PENDING)
     *   - Khach co the thu lai thanh toan
     */
    @Override
    @Transactional
    public void updatePaymentFailed(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderCode));
        order.setPaymentStatus("FAILED");
        orderRepository.save(order);
    }

    // =============================================
    // THONG KE DASHBOARD (ADMIN)
    // =============================================
    /**
     * Lay thong ke dashboard cho admin
     * Bao gom: so don, doanh thu, san pham ban chay...
     */
    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // Dem don theo trang thai
        stats.setTotalOrders(orderRepository.count());
        stats.setPendingOrders(orderRepository.countByStatus("PENDING"));
        stats.setConfirmedOrders(orderRepository.countByStatus("CONFIRMED"));
        stats.setDeliveredOrders(orderRepository.countByStatus("DELIVERED"));
        stats.setCancelledOrders(orderRepository.countByStatus("CANCELLED"));
        stats.setDeliveredFailedOrders(orderRepository.countByStatus("DELIVERED_FAILED"));
        stats.setPendingConfirmOrders(orderRepository.countByPaymentStatus("PENDING_CONFIRM"));
        // COMPLETED chi dem don o trang thai COMPLETED (khong cong DELIVERED)
        // tranh dem trung khi dashboard hien thi ca "Da giao" lan "Hoan thanh"
        stats.setCompletedOrders(orderRepository.countByStatus("COMPLETED"));

        // Tinh doanh thu
        stats.setTotalRevenue(orderRepository.sumRevenueFromCompletedOrders());

        // Doanh thu hom nay
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        stats.setTodayOrders(orderRepository.countCompletedOrdersToday(startOfDay));
        stats.setTodayRevenue(orderRepository.sumRevenueToday(startOfDay));

        // Doanh thu thang nay
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        stats.setMonthRevenue(orderRepository.sumRevenueThisMonth(startOfMonth));

        // Doanh thu nam nay
        LocalDateTime startOfYear = LocalDate.now().withDayOfYear(1).atStartOfDay();
        stats.setYearRevenue(orderRepository.sumRevenueThisYear(startOfYear));

        // =====================================================
        // DOANH THU THEO GIAI DOAN (30 NGAY / 12 THANG / 5 NAM)
        // =====================================================
        // 30 ngay gan nhat
        LocalDateTime thirtyDaysAgo = LocalDate.now().minusDays(30).atStartOfDay();
        List<RevenueByPeriod> revenueByDay = orderRepository.sumRevenueByDay(thirtyDaysAgo).stream()
                .map(row -> {
                    Object periodVal = row[0];
                    String period = periodVal instanceof java.sql.Date
                            ? new java.sql.Date(((java.sql.Date) periodVal).getTime()).toString()
                            : String.valueOf(periodVal);
                    BigDecimal revenue = toBigDecimal(row[1]);
                    long orderCount = toLong(row[2]);
                    return new RevenueByPeriod(period, revenue, orderCount);
                })
                .collect(Collectors.toList());
        stats.setRevenueByDay(revenueByDay);

        // 12 thang gan nhat
        LocalDateTime twelveMonthsAgo = LocalDate.now().minusMonths(12).withDayOfMonth(1).atStartOfDay();
        List<RevenueByPeriod> revenueByMonth = orderRepository.sumRevenueByMonth(twelveMonthsAgo).stream()
                .map(row -> new RevenueByPeriod(
                        String.valueOf(row[0]),
                        toBigDecimal(row[1]),
                        toLong(row[2])
                ))
                .collect(Collectors.toList());
        stats.setRevenueByMonth(revenueByMonth);

        // 5 nam gan nhat
        LocalDateTime fiveYearsAgo = LocalDate.now().minusYears(5).withDayOfYear(1).atStartOfDay();
        List<RevenueByPeriod> revenueByYear = orderRepository.sumRevenueByYear(fiveYearsAgo).stream()
                .map(row -> new RevenueByPeriod(
                        String.valueOf(row[0]),
                        toBigDecimal(row[1]),
                        toLong(row[2])
                ))
                .collect(Collectors.toList());
        stats.setRevenueByYear(revenueByYear);

        // =====================================================
        // TOP 10 SAN PHAM BAN CHAY (tu don COMPLETED/DELIVERED)
        // =====================================================
        List<BestSellingProduct> bestSelling = orderRepository.findBestSellingProducts(10).stream()
                .map(row -> new BestSellingProduct(
                        row[0] == null ? null : ((Number) row[0]).longValue(),
                        String.valueOf(row[1]),
                        toLong(row[2]),
                        toBigDecimal(row[3])
                ))
                .collect(Collectors.toList());
        stats.setBestSellingProducts(bestSelling);

        return stats;
    }

    /**
     * Chuyển đổi an toàn từ Object sang BigDecimal (xử lý BigDecimal, Number, String, null)
     */
    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        try {
            return new BigDecimal(String.valueOf(val));
        } catch (NumberFormatException ex) {
            return BigDecimal.ZERO;
        }
    }

    /**
     * Chuyển đổi an toàn từ Object sang long (xử lý Number, String, null)
     */
    private long toLong(Object val) {
        if (val == null) return 0L;
        if (val instanceof Number) return ((Number) val).longValue();
        try {
            return Long.parseLong(String.valueOf(val));
        } catch (NumberFormatException ex) {
            return 0L;
        }
    }

    // =============================================
    // CHUYEN DOI DU LIEU (Entity -> Response DTO)
    // =============================================

    /**
     * Chuyen doi Order entity -> OrderResponse DTO
     *
     * MUC DICH:
     *   - Entity chua quan he phuc tap (User, OrderItem...)
     *   - Response DTO chi chua du lieu can thiet (khong chua proxy/relationship)
     *   - Giup tra ve JSON sach hon, tranh loi serialization
     */
    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderCode(order.getOrderCode());
        response.setRecipientName(order.getRecipientName());
        response.setRecipientPhone(order.getRecipientPhone());
        response.setShippingAddressLine1(order.getShippingAddressLine1());
        response.setShippingCity(order.getShippingCity());
        response.setShippingProvince(order.getShippingProvince());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setPlacedAt(order.getPlacedAt());
        response.setPaidAt(order.getPaidAt());
        response.setDeliveredAt(order.getDeliveredAt());
        response.setCompletedAt(order.getCompletedAt());
        response.setVnpTxnRef(order.getVnpTxnRef());
        response.setVnpTransactionNo(order.getVnpTransactionNo());
        response.setPaymentMethod(order.getPaymentMethod());

        // Lay ten user neu co
        if (order.getUser() != null) {
            response.setUserName(order.getUser().getFullName());
        }

        // Chuyen doi items
        if (order.getItems() != null) {
            List<OrderItemResponse> itemResponses = order.getItems().stream()
                    .map(this::mapItemToResponse)
                    .collect(Collectors.toList());
            response.setItems(itemResponses);
        }

        return response;
    }

    /**
     * Chuyen doi OrderItem entity -> OrderItemResponse DTO
     */
    private OrderItemResponse mapItemToResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        response.setProductName(item.getProductName());
        response.setProductSku(item.getProductSku());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setLineTotal(item.getLineTotal());
        return response;
    }
}
