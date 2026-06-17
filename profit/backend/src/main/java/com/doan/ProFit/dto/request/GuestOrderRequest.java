package com.doan.ProFit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class GuestOrderRequest {
    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @NotBlank(message = "Phone is required")
    private String recipientPhone;

    @NotBlank(message = "Address is required")
    private String shippingAddressLine1;

    @NotBlank(message = "City is required")
    private String shippingCity;

    private String shippingProvince;
    private String note;

    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    public GuestOrderRequest() {}

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public String getShippingAddressLine1() { return shippingAddressLine1; }
    public void setShippingAddressLine1(String shippingAddressLine1) { this.shippingAddressLine1 = shippingAddressLine1; }

    public String getShippingCity() { return shippingCity; }
    public void setShippingCity(String shippingCity) { this.shippingCity = shippingCity; }

    public String getShippingProvince() { return shippingProvince; }
    public void setShippingProvince(String shippingProvince) { this.shippingProvince = shippingProvince; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}
