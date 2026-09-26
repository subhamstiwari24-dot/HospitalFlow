package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.Patient;
import com.hospitalflow.backend.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(
            @RequestBody RegisterRequest request
    ) {

        try {

            if (request.fullName() == null ||
                    request.fullName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Full name is required"));
            }

            if (request.phone() == null ||
                    !request.phone().matches("\\d{10}")) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Mobile number must be exactly 10 digits"
                        ));
            }

            if (request.email() == null ||
                    request.email().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }

            if (request.password() == null ||
                    request.password().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Password must be at least 6 characters"
                        ));
            }

            Patient patient = patientService.registerPatient(
                    request.fullName(),
                    request.phone(),
                    request.email(),
                    request.password()
            );

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Patient registered successfully");
            response.put("patientId", patient.getId());
            response.put("fullName", patient.getFullName());
            response.put("phone", patient.getPhone());
            response.put("email", patient.getEmail());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginPatient(
            @RequestBody LoginRequest request
    ) {

        if (request.phone() == null ||
                request.phone().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Mobile number is required"
                    ));
        }

        if (request.password() == null ||
                request.password().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Password is required"
                    ));
        }

        Optional<Patient> patientOptional =
                patientService.findByPhone(request.phone());

        if (patientOptional.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid mobile number or password"
                    ));
        }

        Patient patient = patientOptional.get();

        if (!Boolean.TRUE.equals(patient.getActive())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Patient account is inactive"
                    ));
        }

        boolean passwordMatches =
                patientService.verifyPassword(
                        request.password(),
                        patient.getPasswordHash()
                );

        if (!passwordMatches) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid mobile number or password"
                    ));
        }

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login successful");
        response.put("patientId", patient.getId());
        response.put("fullName", patient.getFullName());
        response.put("phone", patient.getPhone());
        response.put("email", patient.getEmail());

        return ResponseEntity.ok(response);
    }

    public record RegisterRequest(
            String fullName,
            String phone,
            String email,
            String password
    ) {
    }

    public record LoginRequest(
            String phone,
            String password
    ) {
    }
}