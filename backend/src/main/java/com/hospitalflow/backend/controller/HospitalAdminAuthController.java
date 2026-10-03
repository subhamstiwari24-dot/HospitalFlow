package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.User;
import com.hospitalflow.backend.service.HospitalAdminAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hospital-admin/auth")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class HospitalAdminAuthController {

    private final HospitalAdminAuthService authService;

    public HospitalAdminAuthController(
            HospitalAdminAuthService authService
    ) {
        this.authService = authService;
    }

    // ==========================================
    // FIRST LOGIN PASSWORD SETUP
    // ==========================================

    @PostMapping("/setup-password")
    public ResponseEntity<?> setupPassword(
            @RequestBody PasswordSetupRequest request
    ) {

        try {

            User user = authService.setupFirstPassword(
                    request.email(),
                    request.newPassword()
            );

            return ResponseEntity.ok(
                    new PasswordSetupResponse(
                            "Password setup successful.",
                            user.getEmail(),
                            user.getRole(),
                            user.getHospitalId()
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ==========================================
    // HOSPITAL ADMIN LOGIN
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            HospitalAdminAuthService.LoginResult result =
                    authService.login(
                            request.email(),
                            request.password()
                    );

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }


    // ==========================================
    // PROTECTED PROFILE TEST
    // ==========================================

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Hospital Admin authentication successful.",

                        "email",
                        authentication.getName(),

                        "role",
                        authentication
                                .getAuthorities()
                                .iterator()
                                .next()
                                .getAuthority()
                )
        );
    }


    // ==========================================
    // REQUEST RECORDS
    // ==========================================

    public record PasswordSetupRequest(
            String email,
            String newPassword
    ) {
    }


    public record LoginRequest(
            String email,
            String password
    ) {
    }


    // ==========================================
    // RESPONSE RECORDS
    // ==========================================

    public record PasswordSetupResponse(
            String message,
            String email,
            String role,
            Long hospitalId
    ) {
    }
}