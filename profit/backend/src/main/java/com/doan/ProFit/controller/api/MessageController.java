package com.doan.ProFit.controller.api;

import com.doan.ProFit.dto.request.MessageRequest;
import com.doan.ProFit.dto.response.MessageResponse;
import com.doan.ProFit.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/my")
    public ResponseEntity<?> getMyMessages(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        String email = authentication.getName();
        List<MessageResponse> messages = messageService.getMessagesByUserEmail(email);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@Valid @RequestBody MessageRequest request, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Vui lòng đăng nhập"));
        }
        String email = authentication.getName();
        try {
            MessageResponse response = messageService.createMessage(request, email);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
