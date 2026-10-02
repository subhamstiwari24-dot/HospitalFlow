package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.Admin;
import com.hospitalflow.backend.security.JwtTokenService;
import com.hospitalflow.backend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "http://localhost:5175", allowCredentials = "true")
public class AdminAuthController {

    private final AdminService adminService;
    private final JwtTokenService jwtTokenService;

    public AdminAuthController(AdminService adminService, JwtTokenService jwtTokenService) {
        this.adminService = adminService;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            Authentication ignored
    ) {
        if (request == null || request.employeeId() == null || request.employeeId().isBlank()
                || request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Employee ID and password are required."));
        }

        return adminService.authenticate(request.employeeId(), request.password())
                .map(admin -> {
                    Map<String, Object> response = profile(admin);
                    response.put("token", jwtTokenService.issueToken(admin.getEmployeeId(), "ADMIN"));
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password.")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return adminService.findByEmployeeId(authentication.getName())
                .filter(admin -> Boolean.TRUE.equals(admin.getActive()))
                .map(admin -> ResponseEntity.ok(profile(admin)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    private static Map<String, Object> profile(Admin admin) {
        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", admin.getEmployeeId());
        response.put("fullName", admin.getFullName());
        response.put("email", admin.getEmail());
        response.put("role", admin.getRole());
        response.put("active", admin.getActive());
        return response;
    }

    public record LoginRequest(String employeeId, String password) {
    }
}