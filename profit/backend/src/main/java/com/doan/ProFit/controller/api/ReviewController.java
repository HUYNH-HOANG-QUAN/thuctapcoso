package com.doan.ProFit.controller.api;

import com.doan.ProFit.dto.request.ReviewRequest;
import com.doan.ProFit.dto.response.ReviewResponse;
import com.doan.ProFit.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized", "message", "Vui lòng đăng nhập"));
        }
        String email = authentication.getName();
        try {
            ReviewResponse response = reviewService.createReview(request, email);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Bad Request", "message", ex.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<?> getMyReviews(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized", "message", "Vui lòng đăng nhập"));
        }
        String email = authentication.getName();
        List<ReviewResponse> reviews = reviewService.getMyReviews(email);
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized", "message", "Vui lòng đăng nhập"));
        }
        String email = authentication.getName();
        try {
            ReviewResponse response = reviewService.updateReview(reviewId, request, email);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Bad Request", "message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(null);
        }
        String email = authentication.getName();
        reviewService.deleteReview(reviewId, email);
        return ResponseEntity.noContent().build();
    }
}
