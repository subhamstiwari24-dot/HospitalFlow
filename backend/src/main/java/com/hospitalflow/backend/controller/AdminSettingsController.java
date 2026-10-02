package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.Admin;
import com.hospitalflow.backend.entity.Hospital;
import com.hospitalflow.backend.entity.HospitalSettings;
import com.hospitalflow.backend.repository.HospitalRepository;
import com.hospitalflow.backend.service.AdminService;
import com.hospitalflow.backend.service.HospitalSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminSettingsController {

    private final HospitalRepository hospitalRepository;
    private final HospitalSettingsService settingsService;
    private final AdminService adminService;
    private final String razorpayKeyId;
    private final String razorpayKeySecret;

    public AdminSettingsController(
            HospitalRepository hospitalRepository,
            HospitalSettingsService settingsService,
            AdminService adminService,
            @Value("${razorpay.key.id:}") String razorpayKeyId,
            @Value("${razorpay.key.secret:}") String razorpayKeySecret
    ) {
        this.hospitalRepository = hospitalRepository;
        this.settingsService = settingsService;
        this.adminService = adminService;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        HospitalSettings settings = settingsService.getOrCreate();
        return ResponseEntity.ok(toResponse(settings.getHospital(), settings));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody SettingsRequest request) {
        try {
            Hospital hospital = hospitalRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No hospital is configured."));
            applyHospital(hospital, request);
            HospitalSettings settings = new HospitalSettings();
            settings.setOpdStartTime(request.opdStartTime());
            settings.setOpdEndTime(request.opdEndTime());
            settings.setBookingEnabled(request.bookingEnabled());
            settings.setSameDayBookingEnabled(request.sameDayBookingEnabled());
            settings.setCancellationEnabled(request.cancellationEnabled());
            settings.setDefaultSlotCapacity(request.defaultSlotCapacity());
            settings.setConsultationDurationMinutes(request.consultationDurationMinutes());
            hospitalRepository.save(hospital);
            return ResponseEntity.ok(toResponse(hospital, settingsService.update(settings)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        } catch (IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        return adminService.findByEmployeeId(authentication.getName())
                .map(this::profile)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody ProfileRequest request) {
        try {
            Admin admin = adminService.updateProfile(authentication.getName(), request.fullName(), request.email());
            return ResponseEntity.ok(profile(admin));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody PasswordRequest request) {
        try {
            adminService.changePassword(authentication.getName(), request.currentPassword(), request.newPassword(), request.confirmPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    private void applyHospital(Hospital hospital, SettingsRequest request) {
        if (request.name() == null || request.name().isBlank()) throw new IllegalArgumentException("Hospital name is required.");
        if (request.email() != null && !request.email().isBlank() && !request.email().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) throw new IllegalArgumentException("Enter a valid hospital email.");
        if (request.pincode() != null && !request.pincode().isBlank() && !request.pincode().matches("^[0-9]{4,10}$")) throw new IllegalArgumentException("Enter a valid pincode.");
        hospital.setName(request.name().trim());
        hospital.setEmail(request.email());
        hospital.setPhone(request.phone());
        hospital.setAddress(request.address());
        hospital.setCity(request.city());
        hospital.setState(request.state());
        hospital.setPincode(request.pincode());
        hospital.setDescription(request.description());
        hospital.setEmergencyAvailable(Boolean.TRUE.equals(request.emergencyAvailable()));
        hospital.setActive(Boolean.TRUE.equals(request.active()));
    }

    private Map<String, Object> toResponse(Hospital hospital, HospitalSettings settings) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> hospitalResponse = new HashMap<>();
        hospitalResponse.put("id", hospital.getId());
        hospitalResponse.put("name", hospital.getName());
        hospitalResponse.put("email", value(hospital.getEmail()));
        hospitalResponse.put("phone", value(hospital.getPhone()));
        hospitalResponse.put("address", value(hospital.getAddress()));
        hospitalResponse.put("city", value(hospital.getCity()));
        hospitalResponse.put("state", value(hospital.getState()));
        hospitalResponse.put("pincode", value(hospital.getPincode()));
        hospitalResponse.put("description", value(hospital.getDescription()));
        hospitalResponse.put("emergencyAvailable", hospital.isEmergencyAvailable());
        hospitalResponse.put("active", hospital.isActive());
        response.put("hospital", hospitalResponse);
        response.put("opdStartTime", settings.getOpdStartTime());
        response.put("opdEndTime", settings.getOpdEndTime());
        response.put("bookingEnabled", settings.getBookingEnabled());
        response.put("sameDayBookingEnabled", settings.getSameDayBookingEnabled());
        response.put("cancellationEnabled", settings.getCancellationEnabled());
        response.put("defaultSlotCapacity", settings.getDefaultSlotCapacity());
        response.put("consultationDurationMinutes", settings.getConsultationDurationMinutes());
        response.put("onlinePaymentConfigured", razorpayKeyId != null && !razorpayKeyId.isBlank()
            && razorpayKeySecret != null && !razorpayKeySecret.isBlank());
        response.put("notificationsSupported", false);
        return response;
    }

    private Map<String, Object> profile(Admin admin) { return Map.of("employeeId", admin.getEmployeeId(), "fullName", admin.getFullName(), "email", admin.getEmail(), "role", admin.getRole(), "active", admin.getActive()); }
    private String value(String value) { return value == null ? "" : value; }

    public record SettingsRequest(String name, String email, String phone, String address, String city, String state, String pincode, String description, Boolean emergencyAvailable, Boolean active, String opdStartTime, String opdEndTime, Boolean bookingEnabled, Boolean sameDayBookingEnabled, Boolean cancellationEnabled, Integer defaultSlotCapacity, Integer consultationDurationMinutes) {}
    public record ProfileRequest(String fullName, String email) {}
    public record PasswordRequest(String currentPassword, String newPassword, String confirmPassword) {}
}