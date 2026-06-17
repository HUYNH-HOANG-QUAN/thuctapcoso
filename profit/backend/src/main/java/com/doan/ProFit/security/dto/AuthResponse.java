package com.doan.ProFit.security.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private final String token;
    private final String tokenType = "Bearer";
    private final String username;
    private final String role;
    private final String fullName;
    private final String phone;

    public AuthResponse(String token, String username, String role, String fullName, String phone) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.fullName = fullName;
        this.phone = phone;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
}
