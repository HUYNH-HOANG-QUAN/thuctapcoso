package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.CategoryRequest;
import com.doan.ProFit.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
