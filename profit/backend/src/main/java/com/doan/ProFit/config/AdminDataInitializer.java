package com.doan.ProFit.config;

import com.doan.ProFit.entity.User;
import com.doan.ProFit.enums.Role;
import com.doan.ProFit.enums.Status;
import com.doan.ProFit.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminDataInitializer {
    private static final Logger log = LoggerFactory.getLogger(AdminDataInitializer.class);

    @Bean
    public CommandLineRunner seedDefaultUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.enabled:true}") boolean adminBootstrapEnabled,
            @Value("${app.bootstrap.admin.full-name:Default Admin}") String fullName,
            @Value("${app.bootstrap.admin.email:admin@profit.com}") String email,
            @Value("${app.bootstrap.admin.phone:0900000000}") String phone,
            @Value("${app.bootstrap.admin.password}") String password,
            @Value("${app.bootstrap.customer.enabled:true}") boolean customerBootstrapEnabled,
            @Value("${app.bootstrap.customer.full-name:Khách Hàng Test}") String customerFullName,
            @Value("${app.bootstrap.customer.email:khachhang@gmail.com}") String customerEmail,
            @Value("${app.bootstrap.customer.phone:0987654321}") String customerPhone,
            @Value("${app.bootstrap.customer.password}") String customerPassword) {
        return args -> {
            if (adminBootstrapEnabled) {
                User admin = userRepository.findByEmail(email.trim())
                        .orElseGet(User::new);
                admin.setFullName(fullName.trim());
                admin.setEmail(email.trim());
                admin.setPhone(phone.trim());
                admin.setRole(Role.ADMIN);
                admin.setStatus(Status.ACTIVE);
                admin.setDeletedAt(null);
                admin.setPasswordHash(passwordEncoder.encode(password));
                userRepository.save(admin);
                log.info("[ProFit] Admin ready: {} / {}", email, password);
                log.debug("[ProFit] Admin hash: {}", admin.getPasswordHash());
            }

            if (customerBootstrapEnabled) {
                User customer = userRepository.findByEmail(customerEmail.trim())
                        .orElseGet(User::new);
                customer.setFullName(customerFullName.trim());
                customer.setEmail(customerEmail.trim());
                customer.setPhone(customerPhone.trim());
                customer.setRole(Role.CUSTOMER);
                customer.setStatus(Status.ACTIVE);
                customer.setDeletedAt(null);
                customer.setPasswordHash(passwordEncoder.encode(customerPassword));
                userRepository.save(customer);
                log.info("[ProFit] Customer ready: {} / {}", customerEmail, customerPassword);
                log.debug("[ProFit] Customer hash: {}", customer.getPasswordHash());
            }

            // Tạo guest user cho đơn hàng vãng lai (không cần đăng nhập)
            User guestUser = userRepository.findByEmail("__guest__@system.internal")
                    .orElseGet(User::new);
            if (guestUser.getId() == null) {
                guestUser.setFullName("Guest User");
                guestUser.setEmail("__guest__@system.internal");
                guestUser.setPhone("0000000000");
                guestUser.setRole(Role.CUSTOMER);
                guestUser.setStatus(Status.ACTIVE);
                guestUser.setDeletedAt(null);
                guestUser.setPasswordHash(passwordEncoder.encode("__guest_dummy_password__"));
                userRepository.save(guestUser);
                log.info("[ProFit] Guest user ready for guest orders (id={})", guestUser.getId());
            }
        };
    }
}
