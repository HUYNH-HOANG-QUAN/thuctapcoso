package com.doan.ProFit.security.service;

import com.doan.ProFit.entity.User;
import com.doan.ProFit.enums.Status;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
    private User user; // Entity User của bạn

    public UserDetailsImpl(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() { return user.getPasswordHash(); }

    @Override
    public String getUsername() { return user.getEmail(); }

    @Override
    public boolean isAccountNonLocked() {
        return user.getStatus() != Status.LOCKED;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() == Status.ACTIVE;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    public String getFullName() { return user.getFullName(); }
    public String getPhone() { return user.getPhone(); }
}