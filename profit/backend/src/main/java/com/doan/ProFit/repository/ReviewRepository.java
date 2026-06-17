package com.doan.ProFit.repository;

import com.doan.ProFit.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = ?1")
    BigDecimal getAverageRatingByProductId(Long productId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = ?1")
    Long countByProductId(Long productId);
    
    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
