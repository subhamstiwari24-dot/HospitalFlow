package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.HospitalRegistration;
import com.hospitalflow.backend.service.HospitalRegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital-registrations")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class HospitalRegistrationController {

    private final HospitalRegistrationService registrationService;

    public HospitalRegistrationController(
            HospitalRegistrationService registrationService) {

        this.registrationService = registrationService;
    }

    /*
     * Get all hospital registration applications.
     */
    @GetMapping
    public ResponseEntity<List<HospitalRegistration>>
    getAllRegistrations() {

        return ResponseEntity.ok(
                registrationService.getAllRegistrations()
        );
    }

    /*
     * Get registrations by status.
     *
     * Example:
     * /api/hospital-registrations/status/PENDING
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<HospitalRegistration>>
    getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                registrationService.getRegistrationsByStatus(
                        status.toUpperCase()
                )
        );
    }

    /*
     * Get a single registration by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HospitalRegistration>
    getRegistrationById(
            @PathVariable Long id) {

        return registrationService
                .getRegistrationById(id)
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity
                                .notFound()
                                .build()
                );
    }

    /*
     * Submit a new hospital registration.
     */
    @PostMapping
    public ResponseEntity<?> createRegistration(
            @RequestBody HospitalRegistration registration) {

        try {

            HospitalRegistration created =
                    registrationService.createRegistration(
                            registration
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(created);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    /*
     * Approve a hospital registration.
     *
     * This will:
     * 1. Create Hospital
     * 2. Create HOSPITAL_ADMIN user
     * 3. Link user to hospital
     * 4. Mark registration as APPROVED
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRegistration(
            @PathVariable Long id,
            @RequestParam(required = false)
            String reviewNotes) {

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

    /*
     * Update registration status manually.
     *
     * Example:
     * PATCH
     * /api/hospital-registrations/1/status
     * ?status=UNDER_REVIEW
     * &reviewNotes=Documents%20are%20being%20verified
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false)
            String reviewNotes) {

        String normalizedStatus =
                status.toUpperCase();

        return registrationService
                .updateStatus(
                        id,
                        normalizedStatus,
                        reviewNotes
                )
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity
                                .notFound()
                                .build()
                );
    }

    /*
     * Delete a registration application.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegistration(
            @PathVariable Long id) {

        if (!registrationService.deleteRegistration(id)) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity
                .noContent()
                .build();
    }
}