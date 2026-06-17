package com.doan.ProFit.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class ReviewRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String comment;

    @Pattern(regexp = "^$|^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    public ReviewRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
