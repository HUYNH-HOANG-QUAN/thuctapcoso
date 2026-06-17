package com.doan.ProFit.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.doan.ProFit.enums.Role;
import com.doan.ProFit.enums.Status;

public class UserUpdateRequest {
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private Status status;
    @JsonAlias("password_hash")
    private String passwordHash;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
