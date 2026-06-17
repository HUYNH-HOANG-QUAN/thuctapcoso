package com.doan.ProFit.repository;

import com.doan.ProFit.entity.ProductTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductTagRepository extends JpaRepository<ProductTag, Long> {
    @Query(value = """
            SELECT pt.display_name
            FROM product_tag_map ptm
            JOIN product_tags pt ON pt.id = ptm.tag_id
            WHERE ptm.product_id = :productId
            ORDER BY pt.display_name
            """, nativeQuery = true)
    List<String> findDisplayNamesByProductId(@Param("productId") Long productId);
}
