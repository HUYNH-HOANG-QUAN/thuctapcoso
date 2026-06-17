package com.doan.ProFit.controller.api;

/**
 * =====================================================
 * VNPayController.java – API Thanh Toán qua Cổng VNPAY
 * =====================================================
 * LUONG HOAT DONG:
 * Controller nay xu ly toan bo yeu cau lien quan den thanh toan
 * qua cong thanh toan trung gian VNPAY.
 *
 * VNPAY LA GI?
 *   VNPAY la cong thanh toan trung gian (payment gateway) cung cap boi
 *   Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank).
 *   Ho tro thanh toan qua nhieu kenh: QR Code, The ngan hang, Vi di dong...
 *
 * BA ENDPOINT CHINH:
 *
 *   1. POST /api/v1/vnpay/create
 *      -> Tao URL thanh toan VNPAY, tra ve paymentUrl de redirect
 *
 *   2. POST /api/v1/vnpay/ipn
 *      -> IPN (Instant Payment Notification)
 *      -> VNPAY goi server-to-server khi thanh toan thanh cong/that bai
 *      -> DAY LA ENDPOINT QUAN TRONG NHAT, cap nhat trang thai don hang
 *
 *   3. GET /api/v1/vnpay/return
 *      -> Return URL (redirect ve website sau khi thanh toan)
 *      -> Hien thi trang ket qua cho khach hang
 *
 * SO DO LUONG:
 *
 *   User chon VNPAY
 *        │
 *        ▼
 *   POST /api/v1/vnpay/create
 *        │ Tao URL thanh toan
 *        ▼
 *   Redirect sang VNPAY (https://sandbox.vnpayment.vn/...)
 *        │
 *        ├──► User thanh toan thanh cong
 *        │         │
 *        │         ▼
 *        │   VNPAY goi POST /api/v1/vnpay/ipn (server-to-server)
 *        │         │ Cap nhat trang thai: PAID + CONFIRMED
 *        │         │
 *        │         ▼
 *        │   VNPAY redirect user ve /vnpay-return
 *        │         │ Hien thi trang thanh cong
 *        │         │
 *        │
 *        └──► User huy / that bai
 *                  │
 *                  ▼
 *            VNPAY goi POST /api/v1/vnpay/ipn
 *                  │ Cap nhat trang thai: FAILED
 *                  │
 *                  ▼
 *            VNPAY redirect user ve /vnpay-return
 *                  │ Hien thi trang that bai
 *                  │
 * =====================================================
 */

import com.doan.ProFit.dto.request.VNPayCreateRequest;
import com.doan.ProFit.entity.Order;
import com.doan.ProFit.repository.OrderRepository;
import com.doan.ProFit.service.OrderService;
import com.doan.ProFit.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vnpay")
public class VNPayController {

    // Logger de ghi log khi VNPAY goi IPN hoac return
    private static final Logger logger = LoggerFactory.getLogger(VNPayController.class);

    // =============================================
    // DEPENDENCY INJECTION
    // =============================================
    // VNPayService: Tao URL thanh toan, verify signature
    @Autowired
    private VNPayService vnPayService;

    // OrderService: Cap nhat trang thai don hang
    @Autowired
    private OrderService orderService;

    // OrderRepository: Truy van don hang (tim theo orderCode)
    @Autowired
    private OrderRepository orderRepository;

    // =============================================
    // ENDPOINT 1: Tao URL thanh toan VNPAY
    // =============================================
    /**
     * Tao URL thanh toan VNPAY de redirect khach hang
     *
     * HTTP Method: POST
     * URL: /api/v1/vnpay/create
     * Auth: PUBLIC (khong can dang nhap)
     *       Vi: Don hang da duoc tao san, chi can verify qua orderCode
     *
     * @param request - { orderCode, amount, locale, bankCode, email }
     * @param httpRequest - HttpServletRequest de lay IP cua client
     *
     * @return 200: { paymentUrl, txnRef }
     *            paymentUrl: Link den trang thanh toan VNPAY
     *            txnRef: Ma tham chieu giao dich (VD: ORD-A3F2B1C7_1718294000)
     *         400: Don khong ton tai hoac loi tao URL
     *
     * LUONG XU LY:
     *   1. Verify don hang ton tai trong DB bang orderCode
     *   2. Lay IP cua khach hang (de gui lenh VNPAY)
     *   3. Tao txnRef = orderCode + "_" + timestamp
     *   4. Goi VNPayService.createPaymentUrl() de tao URL
     *      - Gom cac tham so: amount, txnRef, orderInfo, returnUrl...
     *      - Tao HMAC-SHA512 signature
     *      - Noi signature vao URL
     *   5. Luu txnRef vao order (de luc nhan IPN con doan chinh xac)
     *   6. Tra ve { paymentUrl, txnRef }
     *
     * SAU KHI TRA VE:
     *   Frontend se redirect window.location.href = paymentUrl
     *   User se thay trang thanh toan VNPAY (sandbox hoac production)
     *   Sau khi thanh toan xong, VNPAY se redirect ve /vnpay-return
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestBody VNPayCreateRequest request,
            HttpServletRequest httpRequest) {

        try {
            String orderCode = request.getOrderCode();

            // Verify don ton tai trong DB
            // Su dung orderCode (ma don) thay vi ID vi frontend
            // gui orderCode, khong phai id
            Order order = orderRepository.findByOrderCode(orderCode).orElse(null);

            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Order not found",
                    "message", "Khong tim thay don hang: " + orderCode
                ));
            }

            // Lay IP cua client
            // VNPAY can IP de xac dinh nguon yeu cau
            // Su dung nhieu header de lay IP that (neu co proxy)
            String ipAddress = getClientIp(httpRequest);

            // Tao mã tham chiếu giao dịch
            // Format: ORD-A3F2B1C7_1718294000
            // Phuong phap nay dam bao txnRef la duy nhat va chua ma don
            String txnRef = orderCode + "_" + System.currentTimeMillis();

            // Tao mo ta don hang (hien thi tren trang VNPAY)
            String orderInfo = "Thanh toan don hang " + orderCode + " - ProFit";

            // Chuyen doi so tien
            // VNPAY yeu cau so tien * 100 (VD: 750000 VND -> 75000000)
            // Nhung o day frontend da gui amount*100 roi, nen chi lay longValue
            long amount = request.getAmount().longValue();

            // Tao URL thanh toan VNPAY
            // VNPayService se:
            //   - Sap xep cac tham so theo thu tu bang chu cai
            //   - Tao query string
            //   - Tinh HMAC-SHA512 signature voi hash_secret
            //   - Append signature vao URL
            //   - Tra ve URL day du
            String paymentUrl = vnPayService.createPaymentUrl(
                amount,
                txnRef,
                orderInfo,
                ipAddress,
                request.getLocale()
            );

            // Luu txnRef vao order de sau IPN con doan chinh xac
            try {
                orderService.updateVNPayTxnRef(orderCode, txnRef);
            } catch (Exception e) {
                // Loi khi luu txnRef khong anh huong qua trinh tao URL
                // Van tra ve paymentUrl binh thuong
                logger.warn("Could not update VNPay txn ref: {}", e.getMessage());
            }

            // Tra ve URL thanh toan cho frontend
            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            response.put("txnRef", txnRef);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error creating VNPay payment: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Payment creation failed",
                "message", e.getMessage()
            ));
        }
    }

    // =============================================
    // ENDPOINT 2: IPN (Instant Payment Notification)
    // =============================================
    /**
     * IPN - Thong bao thanh toan ngay lap tuc tu VNPAY
     *
     * HTTP Method: POST
     * URL: /api/v1/vnpay/ipn
     * Auth: VNPAY Signature (khong phai JWT)
     *
     * DAY LA ENDPOINT QUAN TRONG NHAT!
     * VNPAY se goi endpoint nay ngay khi thanh toan xay ra,
     * bat ke nguoi dung co online hay khong.
     * Day la "server-to-server" callback, khong phu thuoc trinh duyet.
     *
     * @param request - Tat ca tham so VNPAY gui kem
     *                  { vnp_ResponseCode, vnp_TransactionStatus,
     *                    vnp_TxnRef, vnp_TransactionNo, vnp_Amount, ... }
     *
     * @return 200: { RspCode, Message }
     *            RspCode = "00" -> Xac nhan thanh cong (VNPAY se khong goi lai)
     *            RspCode = "97" -> Signature khong hop le
     *            RspCode = "99" -> Loi he thong
     *
     * LUONG XU LY:
     *   1. Lay tat ca tham so tu request
     *   2. Verify HMAC-SHA512 signature (dam bao request tu VNPAY, khong phai gia mao)
     *   3. Parse response (doc ResponseCode, TransactionStatus, TxnRef...)
     *   4. Extract orderCode tu txnRef (bo phan timestamp)
     *   5. Kiem tra ket qua thanh toan:
     *      - Thanh cong (ResponseCode="00", Status="00"):
     *        -> orderService.updatePaymentSuccess()
     *        -> status = CONFIRMED, paymentStatus = PAID
     *      - That bai (ResponseCode != "00" hoac Status != "00"):
     *        -> orderService.updatePaymentFailed()
     *        -> paymentStatus = FAILED
     *   6. Tra ve RspCode cho VNPAY (bat buoc phai tra "00" neu xu ly thanh cong)
     */
    @PostMapping("/ipn")
    public ResponseEntity<?> handleIpn(HttpServletRequest request) {
        try {
            // Lay tat ca tham so VNPAY gui kem trong request
            // Su dung getParameterMap() de lay tat ca key-value
            Map<String, String> params = getRequestParams(request);

            logger.info("VNPay IPN received: {}", params);

            // BUOC 1: Verify signature
            // Dam bao request thuc su tu VNPAY, khong phai hacker gia mao
            if (!vnPayService.verifyIpn(params)) {
                logger.warn("VNPay IPN verification failed");
                // Tra ve "97" = Invalid signature
                // VNPAY se goi lai endpoint nay sau
                return ResponseEntity.ok("{\"RspCode\":\"97\",\"Message\":\"Invalid signature\"}");
            }

            // BUOC 2: Parse response tu VNPAY
            VNPayService.VNPayResponse vnpResponse = vnPayService.parseResponse(params);

            // BUOC 3: Extract order code tu txnRef
            // Format txnRef: ORD-A3F2B1C7_1718294000
            // Can tach lay phan orderCode (bo phan timestamp sau "_")
            String txnRef = vnpResponse.getTxnRef();
            String orderCode = txnRef;
            if (txnRef.contains("_")) {
                orderCode = txnRef.substring(0, txnRef.lastIndexOf("_"));
            }

            // BUOC 4: Cap nhat trang thai don hang
            if (vnpResponse.isSuccess()) {
                // THANH CONG: Thanh toan duoc xac nhan boi VNPAY
                // Cap nhat:
                //   - paymentStatus = "PAID"
                //   - status = "CONFIRMED" (don da duoc xac nhan thanh toan)
                //   - paidAt = thoi gian thanh toan
                //   - vnpTransactionNo = ma giao dich VNPAY
                orderService.updatePaymentSuccess(orderCode, vnpResponse.getTransactionId());
                logger.info("VNPay payment success for order: {}", orderCode);
                // RspCode "00" = Confirm Success
                // VNPAY se khong goi lai endpoint nay
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");

            } else {
                // THAT BAI: Thanh toan bi tu choi hoac huy
                // Cap nhat:
                //   - paymentStatus = "FAILED"
                orderService.updatePaymentFailed(orderCode);
                logger.warn("VNPay payment failed for order: {}, response code: {}",
                    orderCode, vnpResponse.getResponseCode());
                // Van tra "00" vi VNPAY da xu ly xong (chi la that bai)
                // Khong tra "99" vi day khong phai loi he thong
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
            }

        } catch (Exception e) {
            // Loi he thong (VD: DB khong ket noi duoc)
            logger.error("Error processing VNPay IPN: ", e);
            // RspCode "99" = System error
            // VNPAY se goi lai endpoint nay sau (retry)
            return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"System error\"}");
        }
    }

    // =============================================
    // ENDPOINT 3: Return URL (Redirect ve website)
    // =============================================
    /**
     * Return URL - VNPAY redirect khach hang ve sau khi thanh toan
     *
     * HTTP Method: GET
     * URL: /api/v1/vnpay/return?vnp_ResponseCode=...&vnp_TxnRef=...
     * Auth: VNPAY Signature (trong query string)
     *
     * DAY LA endpoint ma trinh duyet khach hang se duoc redirect toi
     * sau khi hoan thanh thanh toan tren trang VNPAY.
     * Endpoint nay chi phuc vu viec hien thi ket qua cho khach,
     * khong cap nhat trang thai don (vi IPN da lam roi).
     *
     * @param request - HttpServletRequest chua cac tham so VNPAY trong URL
     *
     * @return 200: { success, message, txnRef, amount, ... }
     *
     * LUONG XU LY:
     *   1. Lay cac tham so tu URL query string
     *   2. Verify signature (dam bao khong bi gia mao)
     *   3. Parse response
     *   4. Tra ve ket qua cho frontend
     *   5. Frontend hien thi trang thanh cong/that bai
     *
     * LUU Y:
     *   - Endpoint nay chi mang tinh thong tin, khong thay doi DB
     *   - Vi: IPN da cap nhat trang thai roi, Return chi de hien thi cho khach
     *   - Neu user tat tab truoc khi VNPAY redirect -> IPN van chay binh thuong
     */
    @GetMapping("/return")
    public ResponseEntity<?> handleReturn(HttpServletRequest request) {
        try {
            // Lay tham so tu query string
            // VD: /api/v1/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=ORD-XXX_...
            Map<String, String> params = getRequestParams(request);

            logger.info("VNPay Return received: {}", params);

            // Verify signature (dam bao khong bi gia mao)
            if (!vnPayService.verifyReturn(params)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid signature"
                ));
            }

            // Parse response tu VNPAY
            VNPayService.VNPayResponse vnpResponse = vnPayService.parseResponse(params);

            // Tao response tra ve cho frontend
            Map<String, Object> response = new HashMap<>();
            response.put("success", vnpResponse.isSuccess());
            response.put("txnRef", vnpResponse.getTxnRef());
            response.put("transactionId", vnpResponse.getTransactionId());
            response.put("amount", vnpResponse.getAmount());
            response.put("responseCode", vnpResponse.getResponseCode());
            response.put("transactionStatus", vnpResponse.getTransactionStatus());
            response.put("bankCode", vnpResponse.getBankCode());

            // Extract order code (bo timestamp khoi txnRef)
            String orderCode = vnpResponse.getTxnRef();
            if (vnpResponse.getTxnRef() != null && vnpResponse.getTxnRef().contains("_")) {
                orderCode = vnpResponse.getTxnRef().substring(
                    0, vnpResponse.getTxnRef().lastIndexOf("_")
                );
            }
            response.put("orderCode", orderCode);

            // Gan message theo ket qua
            if (vnpResponse.isSuccess()) {
                response.put("message", "Thanh toán thành công!");
            } else {
                response.put("message", "Thanh toán không thành công. Mã lỗi: " + vnpResponse.getResponseCode());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing VNPay return: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Có lỗi xảy ra: " + e.getMessage()
            ));
        }
    }

    // =============================================
    // HELPER: Lay IP cua client
    // =============================================
    /**
     * Lay dia chi IP that cua client
     *
     * Khi nguoi dung truy cap qua proxy/load balancer,
     * IP thuc se nam trong header X-Forwarded-For.
     * Can kiem tra nhieu header de lay IP that.
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr(); // Chi con cach nay
        }
        // Neu co nhieu IP (do proxy), lay IP dau tien
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    // =============================================
    // HELPER: Lay tat ca tham so tu request
    // =============================================
    /**
     * Lay tat ca tham so tu HttpServletRequest
     *
     * Chuyen tu Map<String, String[]> sang Map<String, String>
     * de dong nhat xu ly voi VNPayService
     */
    private Map<String, String> getRequestParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();
        for (String name : requestParams.keySet()) {
            String[] values = requestParams.get(name);
            // Lay gia tri dau tien neu co nhieu gia tri
            String valueStr = values != null && values.length > 0 ? values[0] : "";
            params.put(name, valueStr);
        }
        return params;
    }
}
