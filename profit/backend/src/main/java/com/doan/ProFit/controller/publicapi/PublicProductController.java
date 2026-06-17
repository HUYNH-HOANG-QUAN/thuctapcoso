package com.doan.ProFit.controller.publicapi;

import com.doan.ProFit.dto.response.ProductResponse;
import com.doan.ProFit.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({ "/api/public/products", "/api/v1/products" })
public class PublicProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) Long categoryId, // Lọc theo danh mục (tuỳ chọn)
            @RequestParam(required = false) String keyword, // Tìm kiếm theo tên (tuỳ chọn)
            @RequestParam(defaultValue = "0") int page, // Trang số mấy (Mặc định 0)
            @RequestParam(defaultValue = "10") int size // Bao nhiêu sản phẩm 1 trang (Mặc định 10)
    ) {
        // Tạo đối tượng Pageable để báo cho Database biết cần cắt lấy đoạn data nào
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products;

        // Ưu tiên 1: Nếu người dùng có gõ ô tìm kiếm -> Tìm theo tên
        if (keyword != null && !keyword.isEmpty()) {
            products = productService.searchActiveProducts(keyword, pageable);
        }
        // Ưu tiên 2: Nếu người dùng bấm vào 1 danh mục -> Lọc theo ID danh mục
        else if (categoryId != null) {
            products = productService.getActiveProductsByCategory(categoryId, pageable);
        }
        // Mặc định: Lấy tất cả sản phẩm đang hiển thị (Active)
        else {
            products = productService.getActiveProducts(pageable);
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}
