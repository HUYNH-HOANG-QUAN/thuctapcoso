package com.doan.ProFit.security.controller;

import com.doan.ProFit.service.UserService;
import com.doan.ProFit.dto.request.UserCreationRequest;
import com.doan.ProFit.enums.Role;
import com.doan.ProFit.enums.Status;
import com.doan.ProFit.security.dto.AuthResponse;
import com.doan.ProFit.security.dto.LoginRequest;
import com.doan.ProFit.security.jwt.JwtUtils;
import com.doan.ProFit.security.service.UserDetailsImpl;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null
                || loginRequest.getUsername().isBlank() || loginRequest.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập đầy đủ thông tin đăng nhập."));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername().trim(), loginRequest.getPassword())
            );

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse("CUSTOMER");

            String jwt = jwtUtils.generateJwtToken(userDetails, loginRequest.isRememberMe());
            ResponseCookie cookie = ResponseCookie.from(jwtUtils.getJwtCookieName(), jwt)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .sameSite("Lax")
                    .maxAge(jwtUtils.getJwtExpirationMs(loginRequest.isRememberMe()) / 1000)
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok(new AuthResponse(
                    jwt,
                    userDetails.getUsername(),
                    role,
                    userDetails.getFullName(),
                    userDetails.getPhone()
            ));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tên đăng nhập hoặc mật khẩu không đúng."));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Đăng nhập thất bại."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserCreationRequest request) {
        try {
            request.setRole(Role.CUSTOMER);
            request.setStatus(Status.ACTIVE);
            userService.createUser(request);
            return ResponseEntity.ok(Map.of("message", "Đăng ký thành công."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            String errorMsg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
            if (errorMsg.contains("duplicate") || errorMsg.contains("constraint")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email hoặc số điện thoại đã tồn tại."));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Đăng ký thất bại."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(jwtUtils.getJwtCookieName(), "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công."));
    }
}
