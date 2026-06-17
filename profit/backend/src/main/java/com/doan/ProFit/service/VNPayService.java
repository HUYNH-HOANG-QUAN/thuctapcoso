package com.doan.ProFit.service;

import com.doan.ProFit.config.VNPayConfig;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    private final VNPayConfig config;

    public VNPayService(VNPayConfig config) {
        this.config = config;
    }

    /**
     * Tạo URL thanh toán VNPAY
     * @param amount      Số tiền (VND) - controller truyền vào số VND thực
     * @param orderId     Mã đơn hàng (duy nhất)
     * @param orderInfo   Mô tả đơn hàng
     * @param ipAddress   IP của khách hàng
     * @param locale      Ngôn ngữ (vn/en)
     * @return URL thanh toán VNPAY
     */
    public String createPaymentUrl(long amount, String orderId, String orderInfo, String ipAddress, String locale) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", VNPayConfig.VERSION);
        params.put("vnp_Command", VNPayConfig.COMMAND);
        params.put("vnp_TmnCode", config.getVnpTmnCode());
        // VNPAY yêu cầu amount * 100 (đơn vị xu, VND không có phần thập phân)
        // VD: 750000 VND -> 75000000
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", VNPayConfig.CURRENCY_CODE);
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", VNPayConfig.ORDER_TYPE);
        params.put("vnp_Locale", locale != null ? locale : VNPayConfig.LOCALE_VN);
        params.put("vnp_ReturnUrl", config.getVnpReturnUrl());
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        // Tạo query string
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (query.length() > 0) {
                query.append("&");
            }
            query.append(entry.getKey())
                 .append("=")
                 .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }

        // Tạo secure hash
        String hashData = getHashData(params);
        String secureHash = hmacSHA512(config.getVnpHashSecret(), hashData);

        // Build full URL
        return config.getVnpUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    /**
     * Verify response từ VNPAY (return URL)
     */
    public boolean verifyReturn(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return false;
        }

        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isEmpty()) {
            return false;
        }

        // Remove hash field to recalculate
        Map<String, String> paramsWithoutHash = new TreeMap<>(params);
        paramsWithoutHash.remove("vnp_SecureHash");
        paramsWithoutHash.remove("vnp_SecureHashType");

        String hashData = getHashData(paramsWithoutHash);
        String mySecureHash = hmacSHA512(config.getVnpHashSecret(), hashData);

        return mySecureHash.equals(secureHash);
    }

    /**
     * Verify IPN từ VNPAY (server-to-server)
     */
    public boolean verifyIpn(Map<String, String> params) {
        return verifyReturn(params);
    }

    /**
     * Chuyển Map params thành chuỗi hash data
     */
    private String getHashData(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) {
                sb.append("&");
            }
            sb.append(entry.getKey())
              .append("=")
              .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }

    /**
     * HMAC SHA512 encoding
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo HMAC SHA512", e);
        }
    }

    /**
     * Trích xuất các tham số quan trọng từ response
     */
    public VNPayResponse parseResponse(Map<String, String> params) {
        VNPayResponse response = new VNPayResponse();
        response.setTxnRef(params.get("vnp_TxnRef"));
        response.setTransactionId(params.get("vnp_TransactionNo"));
        response.setAmount(Long.parseLong(params.getOrDefault("vnp_Amount", "0")) / 100);
        response.setResponseCode(params.get("vnp_ResponseCode"));
        response.setTransactionStatus(params.get("vnp_TransactionStatus"));
        response.setBankCode(params.get("vnp_BankCode"));
        response.setPayDate(params.get("vnp_PayDate"));
        return response;
    }

    /**
     * Inner class để đóng gói response từ VNPAY
     */
    public static class VNPayResponse {
        private String txnRef;
        private String transactionId;
        private long amount;
        private String responseCode;
        private String transactionStatus;
        private String bankCode;
        private String payDate;

        public String getTxnRef() { return txnRef; }
        public void setTxnRef(String txnRef) { this.txnRef = txnRef; }
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public long getAmount() { return amount; }
        public void setAmount(long amount) { this.amount = amount; }
        public String getResponseCode() { return responseCode; }
        public void setResponseCode(String responseCode) { this.responseCode = responseCode; }
        public String getTransactionStatus() { return transactionStatus; }
        public void setTransactionStatus(String transactionStatus) { this.transactionStatus = transactionStatus; }
        public String getBankCode() { return bankCode; }
        public void setBankCode(String bankCode) { this.bankCode = bankCode; }
        public String getPayDate() { return payDate; }
        public void setPayDate(String payDate) { this.payDate = payDate; }

        public boolean isSuccess() {
            return "00".equals(responseCode) && "00".equals(transactionStatus);
        }
    }
}
