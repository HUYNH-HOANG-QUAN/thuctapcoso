package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.UserCreationRequest;
import com.doan.ProFit.dto.request.UserUpdateRequest;
import com.doan.ProFit.dto.response.UserResponse;
import com.doan.ProFit.entity.User;
import com.doan.ProFit.enums.Role;
import com.doan.ProFit.enums.Status;
import com.doan.ProFit.exception.UserNotFoundException;
import com.doan.ProFit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserProfile(String email, UserUpdateRequest request) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getPasswordHash() != null && !request.getPasswordHash().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPasswordHash()));
        }

        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPasswordHash() == null || request.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPhone(request.getPhone() == null ? null : request.getPhone().trim());
        user.setRole(request.getRole() == null ? Role.CUSTOMER : request.getRole());
        user.setStatus(request.getStatus() == null ? Status.ACTIVE : request.getStatus());
        user.setPasswordHash(passwordEncoder.encode(request.getPasswordHash()));

        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPhone(request.getPhone() == null ? null : request.getPhone().trim());

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus());
    }
}
