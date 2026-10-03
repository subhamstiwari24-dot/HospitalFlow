package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.User;
import com.hospitalflow.backend.repository.UserRepository;
import com.hospitalflow.backend.security.JwtTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class HospitalAdminAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public HospitalAdminAuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    // First login: create the hospital admin password
    public User setupFirstPassword(
            String email,
            String newPassword
    ) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Hospital admin account not found."
                        )
                );

        if (!"HOSPITAL_ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException(
                    "This account is not a Hospital Admin account."
            );
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException(
                    "This account is disabled."
            );
        }

        if (!user.isFirstLogin()) {
            throw new IllegalArgumentException(
                    "First login password has already been set."
            );
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters."
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(newPassword)
        );

        user.setFirstLogin(false);

        return userRepository.save(user);
    }

    // Normal Hospital Admin login
    public LoginResult login(
            String email,
            String password
    ) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password."
                        )
                );

        if (!"HOSPITAL_ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException(
                    "This account is disabled."
            );
        }

        if (user.isFirstLogin() || user.getPasswordHash() == null) {
            throw new IllegalArgumentException(
                    "Please complete first login password setup."
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        String token = jwtTokenService.issueToken(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getHospitalId()
        );

        return new LoginResult(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getHospitalId()
        );
    }

    public record LoginResult(
            String token,
            Long userId,
            String name,
            String email,
            String role,
            Long hospitalId
    ) {
    }
}