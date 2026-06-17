package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.ReviewRequest;
import com.doan.ProFit.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest request, String userEmail);
    List<ReviewResponse> getReviewsByProductId(Long productId);
    List<ReviewResponse> getMyReviews(String userEmail);
    ReviewResponse updateReview(Long reviewId, ReviewRequest request, String userEmail);
    void deleteReview(Long reviewId, String userEmail);
}
