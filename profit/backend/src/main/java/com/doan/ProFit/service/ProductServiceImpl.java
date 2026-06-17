package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.ProductRequest;
import com.doan.ProFit.dto.response.ProductResponse;
import com.doan.ProFit.entity.Category;
import com.doan.ProFit.entity.Product;
import com.doan.ProFit.exception.ResourceNotFoundException;
import com.doan.ProFit.repository.CategoryRepository;
import com.doan.ProFit.repository.ProductImageRepository;
import com.doan.ProFit.repository.ProductRepository;
import com.doan.ProFit.repository.ProductTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ProductTagRepository productTagRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAllForAdmin();
        List<Long> ids = products.stream().map(Product::getId).collect(Collectors.toList());

        Map<Long, String> imageMap = new java.util.HashMap<>();
        if (!ids.isEmpty()) {
            List<Object[]> imageRows = productImageRepository.findBestImageUrlsByProductIds(ids);
            for (Object[] row : imageRows) {
                Long pid = ((Number) row[0]).longValue();
                imageMap.put(pid, (String) row[1]);
            }
        }

        return products.stream()
                .map(p -> mapToResponse(p, imageMap))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdAndIsActiveTrueAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", id));
        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySkus(List<String> skus) {
        if (skus == null || skus.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<Product> products = productRepository.findBySkuIn(skus);
        if (products.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<Long> ids = products.stream().map(Product::getId).collect(Collectors.toList());
        Map<Long, String> imageMap = new HashMap<>();
        List<Object[]> imageRows = productImageRepository.findBestImageUrlsByProductIds(ids);
        for (Object[] row : imageRows) {
            Long pid = ((Number) row[0]).longValue();
            imageMap.put(pid, (String) row[1]);
        }
        return products.stream()
                .map(p -> mapToResponse(p, imageMap))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getActiveProducts(Pageable pageable) {
        Page<Product> page = productRepository.findByIsActiveTrueAndDeletedAtIsNull(pageable);
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getActiveProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndIsActiveTrueAndDeletedAtIsNull(categoryId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchActiveProducts(String keyword, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseAndIsActiveTrueAndDeletedAtIsNull(keyword, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        product.setSku(request.getSku());
        product.setSlug(request.getSlug());
        product.setName(request.getName());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndDeletedAtIsNull(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục", request.getCategoryId()));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", id));

        product.setSku(request.getSku());
        product.setSlug(request.getSlug());
        product.setName(request.getName());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        if (request.getStockQuantity() != null)
            product.setStockQuantity(request.getStockQuantity());
        if (request.getIsActive() != null)
            product.setActive(request.getIsActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndDeletedAtIsNull(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục", request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", id));
        product.setDeletedAt(LocalDateTime.now());
        product.setActive(false);
        productRepository.save(product);
    }

    private ProductResponse mapToResponse(Product product) {
        return mapToResponse(product, null);
    }

    private ProductResponse mapToResponse(Product product, Map<Long, String> imageMap) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setSku(product.getSku());
        response.setSlug(product.getSlug());
        response.setName(product.getName());
        if (imageMap != null) {
            response.setImageUrl(imageMap.get(product.getId()));
        } else {
            try {
                response.setImageUrl(productImageRepository.findBestImageUrlByProductId(product.getId()).orElse(null));
            } catch (Exception e) {
                response.setImageUrl(null);
            }
        }
        response.setShortDescription(product.getShortDescription());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setOldPrice(product.getOldPrice());
        response.setRatingAvg(product.getRatingAvg());
        response.setRatingCount(product.getRatingCount());
        response.setStockQuantity(product.getStockQuantity());
        response.setIsActive(product.getIsActive());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        try {
            response.setTags(productTagRepository.findDisplayNamesByProductId(product.getId()));
        } catch (Exception e) {
            response.setTags(java.util.Collections.emptyList());
        }
        return response;
    }
}
