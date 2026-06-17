package com.doan.ProFit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VNPayConfig {

    @Value("${app.vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${app.vnpay.hash-secret}")
    private String vnpHashSecret;

    @Value("${app.vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpUrl;

    @Value("${app.vnpay.return-url:http://localhost:5173/vnpay-return}")
    private String vnpReturnUrl;

    @Value("${app.vnpay.ipn-url:}")
    private String vnpIpnUrl;

    @Value("${app.vnpay.mode:sandbox}")
    private String vnpMode;

    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "other";
    public static final String CURRENCY_CODE = "VND";
    public static final String LOCALE_VN = "vn";
    public static final String LOCALE_EN = "en";

    public String getVnpTmnCode() {
        return vnpTmnCode;
    }

    public String getVnpHashSecret() {
        return vnpHashSecret;
    }

    public String getVnpUrl() {
        return vnpUrl;
    }

    public String getVnpReturnUrl() {
        return vnpReturnUrl;
    }

    public String getVnpIpnUrl() {
        return vnpIpnUrl;
    }

    public String getVnpMode() {
        return vnpMode;
    }

    public boolean isSandbox() {
        return "sandbox".equalsIgnoreCase(vnpMode);
    }
}
