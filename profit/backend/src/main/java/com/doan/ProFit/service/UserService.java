package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.UserCreationRequest;
import com.doan.ProFit.dto.request.UserUpdateRequest;
import com.doan.ProFit.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserProfile(String email);
    UserResponse updateUserProfile(String email, UserUpdateRequest request);

    UserResponse createUser(UserCreationRequest request);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    void deleteUser(Long id);
}
