package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.HospitalRegistration;
import com.hospitalflow.backend.service.HospitalRegistrationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/hospital-registrations")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class HospitalRegistrationController {

    private final HospitalRegistrationService registrationService;

    public HospitalRegistrationController(
            HospitalRegistrationService registrationService
    ) {
        this.registrationService = registrationService;
    }

    // ==========================================
    // GET ALL REGISTRATIONS
    // SUPER_ADMIN ONLY
    // ==========================================
    @GetMapping
    public ResponseEntity<List<HospitalRegistration>> getAllRegistrations() {
        return ResponseEntity.ok(
                registrationService.getAllRegistrations()
        );
    }

    // ==========================================
    // GET REGISTRATIONS BY STATUS
    // SUPER_ADMIN ONLY
    // ==========================================
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getByStatus(
            @PathVariable String status
    ) {
        try {
            return ResponseEntity.ok(
                    registrationService.getRegistrationsByStatus(
                            status.trim().toUpperCase(Locale.ROOT)
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // GET REGISTRATION BY ID
    // SUPER_ADMIN ONLY
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<HospitalRegistration> getRegistrationById(
            @PathVariable Long id
    ) {
        return registrationService.getRegistrationById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ==========================================
    // SUBMIT NEW HOSPITAL REGISTRATION
    // PUBLIC ENDPOINT
    // ==========================================
    @PostMapping
    public ResponseEntity<?> createRegistration(
            @RequestBody HospitalRegistration registration
    ) {
        try {
            HospitalRegistration created =
                    registrationService.createRegistration(registration);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(created);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // APPROVE HOSPITAL REGISTRATION
    // SUPER_ADMIN ONLY
    // ==========================================
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRegistration(
            @PathVariable Long id,
            @RequestParam(required = false) String reviewNotes
    ) {
        try {
            HospitalRegistration approved =
                    registrationService.approveRegistration(
                            id,
                            reviewNotes
                    );

            return ResponseEntity.ok(approved);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // UPDATE REGISTRATION STATUS
    // SUPER_ADMIN ONLY
    //
    // Allowed:
    // UNDER_REVIEW
    // REJECTED
    //
    // APPROVED must use the dedicated approve endpoint.
    // ==========================================
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reviewNotes
    ) {
        try {
            return registrationService.updateStatus(
                            id,
                            status,
                            reviewNotes
                    )
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // DELETE REGISTRATION
    // SUPER_ADMIN ONLY
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegistration(
            @PathVariable Long id
    ) {
        if (!registrationService.deleteRegistration(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
