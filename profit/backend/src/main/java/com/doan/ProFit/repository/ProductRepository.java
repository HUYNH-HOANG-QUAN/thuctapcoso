package com.doan.ProFit.repository;

import com.doan.ProFit.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("""
            SELECT p FROM Product p
            WHERE p.deletedAt IS NULL
            ORDER BY p.createdAt DESC
            """)
    List<Product> findAllForAdmin();

    @Query("""
            SELECT p FROM Product p
            WHERE p.isActive = true
                AND p.deletedAt IS NULL
                AND (p.category IS NULL OR (p.category.isActive = true AND p.category.deletedAt IS NULL))
            """)
    List<Product> findByIsActiveTrueAndDeletedAtIsNull();

    @Query("""
            SELECT p FROM Product p
            WHERE p.isActive = true
                AND p.deletedAt IS NULL
                AND (p.category IS NULL OR (p.category.isActive = true AND p.category.deletedAt IS NULL))
            """)
    Page<Product> findByIsActiveTrueAndDeletedAtIsNull(Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            WHERE p.category.id = :categoryId
                AND p.isActive = true
                AND p.deletedAt IS NULL
                AND p.category.isActive = true
                AND p.category.deletedAt IS NULL
            """)
    Page<Product> findByCategoryIdAndIsActiveTrueAndDeletedAtIsNull(@Param("categoryId") Long categoryId,
            Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
                AND p.isActive = true
                AND p.deletedAt IS NULL
                AND (p.category IS NULL OR (p.category.isActive = true AND p.category.deletedAt IS NULL))
            """)
    Page<Product> findByNameContainingIgnoreCaseAndIsActiveTrueAndDeletedAtIsNull(@Param("name") String name,
            Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            WHERE p.id = :id
                AND p.isActive = true
                AND p.deletedAt IS NULL
                AND (p.category IS NULL OR (p.category.isActive = true AND p.category.deletedAt IS NULL))
            """)
    Optional<Product> findByIdAndIsActiveTrueAndDeletedAtIsNull(@Param("id") Long id);

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);
}
