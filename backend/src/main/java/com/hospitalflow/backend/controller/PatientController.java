package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.Patient;
import com.hospitalflow.backend.entity.OtpVerification;
import com.hospitalflow.backend.service.OtpService;
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
        private final OtpService otpService;

        public PatientController(PatientService patientService, OtpService otpService) {
        this.patientService = patientService;
                this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(
            @RequestBody RegisterRequest request
    ) {

        try {

            if (request.fullName() == null ||
                    request.fullName().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Full name is required"
                        ));
            }

            if (request.age() == null ||
                    request.age() < 1 ||
                    request.age() > 120) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Please enter a valid age"
                        ));
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
                        .body(Map.of(
                                "message",
                                "Email is required"
                        ));
            }

            if (request.password() == null ||
                    request.password().length() < 6) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Password must be at least 6 characters"
                        ));
            }

            if (!request.email().trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Enter a valid email address"));
            }

            patientService.savePendingRegistration(request.fullName(), request.age(), request.phone(),
                    request.email(), request.password());
            String devOtp = otpService.issue(request.email(), OtpVerification.Purpose.REGISTRATION);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "A verification OTP has been sent to your email");
            if (devOtp != null) {
                response.put("devOtp", devOtp);
            }

            return ResponseEntity
                    .status(HttpStatus.ACCEPTED)
                    .body(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed"));
        }
    }

        @PostMapping("/register/verify")
        public ResponseEntity<?> verifyRegistration(@RequestBody OtpRequest request) {
                try {
                        otpService.verify(request.email(), OtpVerification.Purpose.REGISTRATION, request.otp());
                        Patient patient = patientService.completePendingRegistration(request.email().trim().toLowerCase());
                        return ResponseEntity.status(HttpStatus.CREATED).body(patientResponse("Patient registered successfully", patient));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
                }
        }

        @PostMapping("/register/resend")
        public ResponseEntity<?> resendRegistrationOtp(@RequestBody EmailRequest request) {
                try {
                        String devOtp = otpService.issue(request.email(), OtpVerification.Purpose.REGISTRATION);
                        Map<String, Object> response = new HashMap<>();
                        response.put("message", "A verification OTP has been sent to your email");
                        if (devOtp != null) response.put("devOtp", devOtp);
                        return ResponseEntity.accepted().body(response);
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("message", e.getMessage()));
                }
        }

        @PostMapping("/forgot-password/request")
        public ResponseEntity<?> requestPasswordReset(@RequestBody EmailRequest request) {
                String generic = "If an account exists with this email, an OTP has been sent.";
                if (request.email() == null || !request.email().trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                        return ResponseEntity.ok(Map.of("message", generic));
                }
                try {
                        String devOtp = otpService.issue(request.email(), OtpVerification.Purpose.FORGOT_PASSWORD);
                        if (devOtp != null) return ResponseEntity.ok(Map.of("message", generic, "devOtp", devOtp));
                } catch (IllegalArgumentException ignored) {
                        // Keep cooldown state private.
                }
                return ResponseEntity.ok(Map.of("message", generic));
        }

        @PostMapping("/forgot-password/verify")
        public ResponseEntity<?> verifyPasswordReset(@RequestBody OtpRequest request) {
                try {
                        String resetToken = otpService.verify(request.email(), OtpVerification.Purpose.FORGOT_PASSWORD, request.otp());
                        return ResponseEntity.ok(Map.of("message", "OTP verified", "resetToken", resetToken));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
                }
        }

        @PostMapping("/forgot-password/reset")
        public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
                if (request.newPassword() == null || request.newPassword().length() < 6) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
                }
                if (!otpService.isValidResetToken(request.email(), request.resetToken())) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired reset session"));
                }
                try {
                        patientService.updatePassword(request.email().trim().toLowerCase(), request.newPassword());
                            otpService.consumeResetToken(request.email(), request.resetToken());
                        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
                }
        }

        private Map<String, Object> patientResponse(String message, Patient patient) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", message);
                response.put("patientId", patient.getPatientId());
                response.put("fullName", patient.getFullName());
                response.put("age", patient.getAge());
                response.put("phone", patient.getPhone());
                response.put("email", patient.getEmail());
                return response;
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

        response.put(
                "message",
                "Login successful"
        );

        response.put(
                "patientId",
                patient.getPatientId()
        );

        response.put(
                "fullName",
                patient.getFullName()
        );

        response.put(
                "age",
                patient.getAge()
        );

        response.put(
                "phone",
                patient.getPhone()
        );

        response.put(
                "email",
                patient.getEmail()
        );

        return ResponseEntity.ok(response);
    }

    public record RegisterRequest(
            String fullName,
            Integer age,
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

        public record EmailRequest(String email) {}

        public record OtpRequest(String email, String otp) {}

        public record ResetPasswordRequest(String email, String resetToken, String newPassword) {}
}