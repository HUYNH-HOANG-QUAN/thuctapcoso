package com.doan.ProFit.controller.api;

import com.doan.ProFit.dto.request.UserUpdateRequest;
import com.doan.ProFit.dto.response.UserResponse;
import com.doan.ProFit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody UserUpdateRequest request, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateUserProfile(email, request));
    }
}
