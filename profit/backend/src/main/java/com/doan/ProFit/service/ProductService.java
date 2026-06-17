package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.ProductRequest;
import com.doan.ProFit.dto.response.ProductResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(Long id);
    Page<ProductResponse> getActiveProducts(Pageable pageable);
    Page<ProductResponse> getActiveProductsByCategory(Long categoryId, Pageable pageable);
    Page<ProductResponse> searchActiveProducts(String keyword, Pageable pageable);

    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}
