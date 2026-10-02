package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Admin;
import com.hospitalflow.backend.repository.AdminRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Locale;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public Optional<Admin> authenticate(String employeeId, String password) {
        if (employeeId == null || password == null) {
            return Optional.empty();
        }

        return adminRepository.findByEmployeeIdIgnoreCase(employeeId.trim())
                .filter(admin -> Boolean.TRUE.equals(admin.getActive()))
                .filter(admin -> admin.getPasswordHash() != null
                        && passwordEncoder.matches(password, admin.getPasswordHash()));
    }

    public Optional<Admin> findByEmployeeId(String employeeId) {
        if (employeeId == null || employeeId.isBlank()) {
            return Optional.empty();
        }

        return adminRepository.findByEmployeeIdIgnoreCase(employeeId.trim());
    }

    public Admin updateProfile(String employeeId, String fullName, String email) {
        if (fullName == null || fullName.isBlank() || email == null || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("Full name and a valid email are required.");
        }
        Admin admin = findByEmployeeId(employeeId).orElseThrow(() -> new IllegalArgumentException("Admin account not found."));
        admin.setFullName(fullName.trim());
        admin.setEmail(email.trim().toLowerCase(Locale.ROOT));
        return adminRepository.save(admin);
    }

    public void changePassword(String employeeId, String currentPassword, String newPassword, String confirmPassword) {
        Admin admin = findByEmployeeId(employeeId).orElseThrow(() -> new IllegalArgumentException("Admin account not found."));
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, admin.getPasswordHash())) throw new IllegalArgumentException("Current password is incorrect.");
        if (newPassword == null || newPassword.length() < 8) throw new IllegalArgumentException("New password must be at least 8 characters.");
        if (!newPassword.equals(confirmPassword)) throw new IllegalArgumentException("New passwords do not match.");
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
    }
}