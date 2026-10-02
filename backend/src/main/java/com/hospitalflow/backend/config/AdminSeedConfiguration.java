package com.hospitalflow.backend.config;

import com.hospitalflow.backend.entity.Admin;
import com.hospitalflow.backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Locale;

@Configuration
public class AdminSeedConfiguration {

    @Bean
    public org.springframework.boot.CommandLineRunner seedAdmin(
            AdminRepository adminRepository,
            @Value("${hospitalflow.admin.seed.enabled:false}") boolean enabled,
            @Value("${hospitalflow.admin.seed.employee-id:}") String employeeId,
            @Value("${hospitalflow.admin.seed.full-name:}") String fullName,
            @Value("${hospitalflow.admin.seed.email:}") String email,
            @Value("${hospitalflow.admin.seed.password:}") String password
    ) {
        return args -> {
            if (!enabled) {
                return;
            }

            if (employeeId.isBlank() || fullName.isBlank() || email.isBlank() || password.isBlank()) {
                throw new IllegalStateException(
                        "Admin seed requires employee-id, full-name, email, and password environment values"
                );
            }

            if (adminRepository.findByEmployeeIdIgnoreCase(employeeId.trim()).isPresent()) {
                return;
            }

            Admin admin = new Admin();
            admin.setEmployeeId(employeeId.trim());
            admin.setFullName(fullName.trim());
            admin.setEmail(email.trim().toLowerCase(Locale.ROOT));
            admin.setPasswordHash(new BCryptPasswordEncoder().encode(password));
            admin.setRole("ADMIN");
            admin.setActive(true);
            adminRepository.save(admin);
        };
    }
}