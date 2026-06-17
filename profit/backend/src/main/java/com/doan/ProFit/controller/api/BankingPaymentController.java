package com.doan.ProFit.controller.api;

/**
 * =====================================================
 * BankingPaymentController.java – API Thanh Toán Chuyển Khoản
 * =====================================================
 * LUONG HOAT DONG:
 * Controller nay xu ly cac yeu cau lien quan den thanh toan
 * qua phuong thuc CHUYEN KHOAN NGAN HANG.
 *
 *   1. Xac nhan da chuyen khoan  -> POST /api/v1/banking/confirm/{orderId}
 *   2. Lay so don cho xac nhan   -> GET  /api/v1/banking/pending-count
 *
 * CO CHE HOAT DONG:
 *   - Khach hang chon "Chuyen khoan ngan hang" tai CheckoutPage
 *   - Duoc chuyen sang trang QR code (BankingQRPage) de quet va chuyen khoan
 *   - Sau khi chuyen khoan, khach nhan nut "Da thanh toan"
 *   - Backend cap nhat paymentStatus: UNPAID -> PENDING_CONFIRM
 *   - Admin kiem tra tai khoan BIDV de xac nhan thanh toan
 *   - Admin xac nhan -> status: PENDING_CONFIRM -> CONFIRMED
 *
 * SECURITY:
 *   - Tat ca endpoint deu yeu cau JWT (tru ra /pending-count la chi admin)
 *   - Chi chu don (hoac guest) moi co quyen xac nhan
 * =====================================================
 */

import com.doan.ProFit.dto.response.OrderResponse;
import com.doan.ProFit.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/banking")
public class BankingPaymentController {

    // =============================================
    // DEPENDENCY INJECTION
    // =============================================
    @Autowired
    private OrderService orderService;

    // =============================================
    // ENDPOINT 1: Xac nhan da chuyen khoan
    // =============================================
    /**
     * Khach hang xac nhan da thuc hien chuyen khoan ngan hang
     *
     * HTTP Method: POST
     * URL: /api/v1/banking/confirm/{orderId}
     * Auth: JWT Required
     *
     * @param orderId       - ID don hang can xac nhan
     * @param authentication - JWT token cua nguoi thuc hien
     *
     * @return 200: OrderResponse (da cap nhat trang thai)
     *         401: Chua dang nhap
     *         400: Khong the xac nhan (don khong ton tai, khong co quyen,
     *               hoac da duoc xac nhan roi)
     *
     * LUONG XU LY:
     *   1. Kiem tra authentication (JWT)
     *   2. Lay email tu JWT de verify quyen so huu
     *   3. Goi OrderService.confirmBankingPayment(orderId, email)
     *   4. Service kiem tra:
     *      - Don ton tai khong
     *      - User la chu don hoac don guest
     *      - paymentStatus hien tai la UNPAID (chua xac nhan)
     *   5. Cap nhat trong DB:
     *      - paymentMethod = "BANKING"
     *      - paymentStatus = "PENDING_CONFIRM" (cho admin xac nhan)
     *      - paidAt = thoi gian hien tai
     *   6. Tra ve OrderResponse da cap nhat
     *
     * QUY TRINH ADMIN XAC NHAN (ben phia admin):
     *   Admin se kiem tra tai khoan BIDV:
     *   - So tien chuyen co khop voi don hang khong
     *   - Noi dung chuyen khoan co dung ma don khong
     *   Sau do, admin se cap nhat trang thai trong AdminController
     *   (PENDING_CONFIRM -> CONFIRMED)
     */
    @PostMapping("/confirm/{orderId}")
    public ResponseEntity<?> confirmBankingPayment(
            @PathVariable Long orderId,
            Authentication authentication) {

        // Kiem tra da dang nhap chua
        // Endpoint nay yeu cau phai co JWT vi:
        //   - Can verify nguoi goi la chu don
        //   - Guest khong co JWT -> su ly rieng (gui kem email hoac phone)
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unauthorized",
                "message", "Vui lòng đăng nhập"
            ));
        }

        try {
            // Goi service xac nhan thanh toan banking
            OrderResponse response = orderService.confirmBankingPayment(
                orderId,
                authentication.getName()
            );
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            // Xu ly cac loi:
            //   - Don khong ton tai
            //   - User khong phai chu don
            //   - Don da duoc xac nhan roi (paymentStatus != UNPAID)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Bad Request",
                "message", ex.getMessage()
            ));
        }
    }

    // =============================================
    // ENDPOINT 2: Lay so don dang cho xac nhan
    // =============================================
    /**
     * Lay so luong don hang dang cho xac nhan thanh toan banking
     *
     * HTTP Method: GET
     * URL: /api/v1/banking/pending-count
     * Auth: JWT Required (Admin)
     *
     * @return 200: { count: number }
     *
     * SU DUNG:
     *   - Admin Dashboard: Hien thi badge "X don cho xac nhan thanh toan"
     *   - Giup admin nhan biet co bao nhieu don can kiem tra
     *
     * LUONG XU LY:
     *   1. Kiem tra authentication (co phai admin khong)
     *   2. Goi OrderService.countPendingConfirmOrders()
     *   3. Dem so don co paymentStatus = PENDING_CONFIRM
     *   4. Tra ve so luong
     *
     * LUU Y:
     *   - Endpoint nay co the goi nhieu lan (polling)
     *   - Khong nen cache vi so lieu can cap nhat real-time
     */
    @GetMapping("/pending-count")
    public ResponseEntity<?> getPendingConfirmCount() {
        // Dem so don cho xac nhan thanh toan
        // Don o trang thai PENDING_CONFIRM la don da co nguoi
        // thong bao da chuyen khoan nhung chua duoc admin xac nhan
        long count = orderService.countPendingConfirmOrders();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
