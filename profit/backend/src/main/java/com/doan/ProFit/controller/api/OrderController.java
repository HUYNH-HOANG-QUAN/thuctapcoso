package com.doan.ProFit.controller.api;

/**
 * =====================================================
 * OrderController.java – REST API cho Quản lý Đơn hàng
 * =====================================================
 * LUONG HOAT DONG:
 * Controller nay xu ly cac yeu cau API lien quan den don hang:
 *
 *   1. Tao don hang (user da dang nhap)  -> POST /api/orders/create
 *   2. Tao don hang (khach vang lai)     -> POST /api/orders/guest
 *   3. Lay danh sach don hang cua toi    -> GET  /api/orders/my-orders
 *   4. Huy don hang cua minh            -> POST /api/orders/{id}/cancel
 *
 * SECURITY:
 *   - Mot so endpoint yeu cau JWT token (xac thuc)
 *   - Mot so endpoint cong khai (guest checkout)
 *   - Chi chu don hoac admin moi co quyen thuc hien hanh dong
 *
 * CO CHE PHAN QUYEN:
 *   - User chi co the xem/huy don cua chinh minh
 *   - Admin co quyen xem/sua tat ca don hang (trong AdminController)
 * =====================================================
 */

import com.doan.ProFit.dto.request.GuestOrderRequest;
import com.doan.ProFit.dto.request.OrderRequest;
import com.doan.ProFit.dto.response.OrderResponse;
import com.doan.ProFit.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // Logger de ghi log, giup debug khi co loi
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    // =============================================
    // DEPENDENCY INJECTION
    // =============================================
    // OrderService: xu ly logic nghiep vu don hang
    // Duoc inject vao day thong qua Spring IoC container
    @Autowired
    private OrderService orderService;

    // =============================================
    // ENDPOINT 1: Tao don hang (User da dang nhap)
    // =============================================
    /**
     * Tao don hang cho nguoi da dang nhap
     *
     * HTTP Method: POST
     * URL: /api/orders/create
     * Auth: JWT Required (phai dang nhap)
     *
     * @param request  - Du lieu don hang tu frontend
     *                  { recipientName, recipientPhone, shippingAddressLine1,
     *                    shippingCity, shippingProvince, note, items[] }
     * @param authentication - Spring Security tu dong inject sau khi xac thuc JWT
     *                        Lay email tu token de tim user trong DB
     *
     * @return 200: OrderResponse (don hang da duoc tao)
     *         401: Chua dang nhap
     *         400: Du lieu khong hop le
     *
     * LUONG XU LY:
     *   1. Kiem tra authentication (JWT da duoc filter xu ly)
     *   2. Neu khong co token -> tra ve 401 Unauthorized
     *   3. Extract email tu JWT token
     *   4. Goi OrderService.createOrder(request, email)
     *   5. Tra ve OrderResponse
     */
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {

        // Kiem tra nguoi dung da dang nhap chua
        // authentication.getName() tra ve email cua user (duoc set trong JWT)
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of(
                "error", "Unauthorized",
                "message", "Vui lòng đăng nhập để đặt hàng"
            ));
        }

        // Lay email tu JWT token
        // Day la email da duoc ma hoa trong token khi dang nhap
        String email = authentication.getName();

        try {
            // Goi service de tao don hang
            // Service se:
            //   - Tim user trong DB bang email
            //   - Sinh ma don ORD-XXXXXXXX
            //   - Tao Order + OrderItem trong DB
            //   - Tra ve OrderResponse
            OrderResponse response = orderService.createOrder(request, email);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            // Xu ly loi validation (VD: san pham khong ton tai)
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "error", "Bad Request",
                "message", ex.getMessage()
            ));
        }
    }

    // =============================================
    // ENDPOINT 2: Tao don hang (Khach vang lai / Guest)
    // =============================================
    /**
     * Tao don hang cho khach vang lai (khong can dang nhap)
     *
     * HTTP Method: POST
     * URL: /api/orders/guest
     * Auth: Khong can (public endpoint)
     *
     * @param request - Tuong tu createOrder, nhung khong can JWT
     *
     * @return 200: OrderResponse (don hang da duoc tao)
     *         400: Du lieu khong hop le
     *
     * LUONG XU LY:
     *   1. Khong kiem tra authentication (ai cung goi duoc)
     *   2. Service se gan don cho user noi bo: __guest__@system.internal
     *   3. Tao Order + OrderItem nhu binh thuong
     *   4. Tra ve OrderResponse
     *
     * DAC DIEM:
     *   - Khach hang khong can dang ky/dang nhap van dat duoc hang
     *   - Don guest duoc luu trong DB nhung khong lien ket voi tai khoan
     *   - Khach khong the theo doi don qua trang "Don hang cua toi"
     */
    @PostMapping("/guest")
    public ResponseEntity<OrderResponse> createGuestOrder(
            @Valid @RequestBody GuestOrderRequest request) {

        // Goi service de tao don guest
        // Khong can email vi khach chua dang nhap
        OrderResponse response = orderService.createGuestOrder(request);
        return ResponseEntity.ok(response);
    }

    // =============================================
    // ENDPOINT 3: Lay danh sach don hang cua toi
    // =============================================
    /**
     * Lay danh sach don hang cua nguoi dung hien tai
     *
     * HTTP Method: GET
     * URL: /api/orders/my-orders
     * Auth: JWT Required
     *
     * @param authentication - Spring Security inject JWT token
     *
     * @return 200: List<OrderResponse> (mang don hang)
     *         401: Chua dang nhap
     *         400: Loi khi truy van
     *
     * LUONG XU LY:
     *   1. Kiem tra authentication
     *   2. Extract email tu JWT
     *   3. Goi OrderService.getMyOrders(email)
     *   4. Tra ve danh sach don (da sort theo thoi gian giam dan)
     *
     * LUU Y:
     *   - Chi tra ve don cua user dang nhap
     *   - Don guest (neu co) se nam trong localStorage frontend, khong nam o day
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {

        // Kiem tra da dang nhap chua
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of(
                "error", "Unauthorized",
                "message", "Vui lòng đăng nhập"
            ));
        }

        // Lay email tu JWT
        String email = authentication.getName();

        try {
            // Goi service lay danh sach don hang
            List<OrderResponse> response = orderService.getMyOrders(email);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            // Loi khi tim user (hiem khi xay ra)
            logger.warn("Order not found for user {}: {}", email, ex.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "error", "Bad Request",
                "message", ex.getMessage()
            ));

        } catch (Exception ex) {
            // Loi he thong (VD: DB loi)
            logger.error("Failed to get orders for user {}: {}", email, ex.getMessage(), ex);
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", "Internal Server Error",
                "message", "Không thể lấy danh sách đơn hàng"
            ));
        }
    }

    // =============================================
    // ENDPOINT 4: Huy don hang cua minh
    // =============================================
    /**
     * Khach hang tu huy don hang cua minh
     *
     * HTTP Method: POST
     * URL: /api/orders/{id}/cancel
     * Auth: JWT Required
     *
     * @param id - ID don hang can huy
     * @param authentication - JWT token cua nguoi thuc hien
     *
     * @return 200: OrderResponse (da duoc huy)
     *         401: Chua dang nhap
     *         400: Khong the huy (don khong thuoc quyen hoac trang thai khong cho phep)
     *
     * LUONG XU LY:
     *   1. Kiem tra authentication
     *   2. Lay email tu JWT
     *   3. Goi OrderService.cancelOrder(id, email)
     *   4. Service kiem tra:
     *      - Don co ton tai khong
     *      - User co phai chu don khong
     *      - Don co o trang thai cho phep huy khong (PENDING hoac PENDING_CONFIRM)
     *   5. Cap nhat status = CANCELLED
     *   6. Neu stock da bi tru -> goi restoreStock() de hoan
     *
     * HAN CHE:
     *   - Chi cho phep huy don PENDING (cho xac nhan)
     *   - Khong cho phep huy don da xac nhan, dang giao, da giao
     *   - Don guest cua nguoi khac khong the huy
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {

        // Kiem tra da dang nhap chua
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of(
                "error", "Unauthorized",
                "message", "Vui lòng đăng nhập"
            ));
        }

        try {
            // Goi service huy don
            // Email duoc truyen vao de verify chu don
            OrderResponse response = orderService.cancelOrder(id, authentication.getName());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            // Loi: khong co quyen hoac trang thai khong cho phep
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "error", "Bad Request",
                "message", ex.getMessage()
            ));
        }
    }
}
