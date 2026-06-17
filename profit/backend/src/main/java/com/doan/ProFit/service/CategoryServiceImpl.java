package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.CategoryRequest;
import com.doan.ProFit.dto.response.CategoryResponse;
import com.doan.ProFit.entity.Category;
import com.doan.ProFit.exception.ResourceNotFoundException;
import com.doan.ProFit.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByIsActiveTrueAndDeletedAtIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findByIdAndDeletedAtIsNull(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục cha", request.getParentId()));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        if (request.getIsActive() != null)
            category.setActive(request.getIsActive());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findByIdAndDeletedAtIsNull(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục cha", request.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));
        category.setDeletedAt(LocalDateTime.now());
        category.setActive(false);
        categoryRepository.save(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setIsActive(category.getIsActive());
        response.setCreatedAt(category.getCreatedAt());
        if (category.getParent() != null) {
            response.setParentId(category.getParent().getId());
        }
        return response;
    }
}
