package com.doan.ProFit.dto.request;

import java.math.BigDecimal;

public class ProductRequest {
    private String sku;
    private String slug;
    private String name;
    private String shortDescription;
    private String description;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private Integer stockQuantity;
    private Long categoryId;
    private Boolean isActive;

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getOldPrice() { return oldPrice; }
    public void setOldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
