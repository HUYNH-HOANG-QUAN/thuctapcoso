package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.ReviewRequest;
import com.doan.ProFit.dto.response.ReviewResponse;
import com.doan.ProFit.entity.Product;
import com.doan.ProFit.entity.Review;
import com.doan.ProFit.entity.User;
import com.doan.ProFit.repository.ProductRepository;
import com.doan.ProFit.repository.ReviewRepository;
import com.doan.ProFit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest request, String userEmail) {
        User user = userRepository.findByEmailOrPhone(userEmail, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Product product = productRepository.findByIdAndIsActiveTrueAndDeletedAtIsNull(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setPhone(request.getPhone());
        review.setIsVerifiedPurchase(false);

        Review saved = reviewRepository.save(review);

        updateProductRating(product.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(String userEmail) {
        User user = userRepository.findByEmailOrPhone(userEmail, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        User user = userRepository.findByEmailOrPhone(userEmail, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update your own reviews");
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }

        Review saved = reviewRepository.save(review);
        updateProductRating(saved.getProduct().getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        User user = userRepository.findByEmailOrPhone(userEmail, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only delete your own reviews");
        }

        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);
        updateProductRating(productId);
    }

    @Transactional
    private void updateProductRating(Long productId) {
        BigDecimal avg = reviewRepository.getAverageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setRatingAvg(avg != null ? avg.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            product.setRatingCount(count != null ? count.intValue() : 0);
            productRepository.save(product);
        }
    }

    private ReviewResponse mapToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setProductId(review.getProduct().getId());
        response.setProductName(review.getProduct().getName());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFullName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setPhone(review.getPhone());
        response.setIsVerifiedPurchase(review.getIsVerifiedPurchase());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
