package com.doan.ProFit.security.controller;

import com.doan.ProFit.entity.User;
import com.doan.ProFit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class ForgotPasswordController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không được trống."));
        }

        User user = userRepository.findByEmail(email.trim()).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(Map.of(
                    "message", "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.",
                    "demo", true
            ));
        }

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        String resetLink = String.format(
                "http://localhost:5173/reset-password?token=%s",
                token
        );

        return ResponseEntity.ok(Map.of(
                "message", "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.",
                "demo", true,
                "resetLink", resetLink
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token không hợp lệ."));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu mới phải có ít nhất 6 ký tự."));
        }

        User user = userRepository.findByResetToken(token).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token không hợp lệ hoặc đã hết hạn."));
        }

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Liên kết đặt lại mật khẩu đã hết hạn."));
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công!"));
    }
}
