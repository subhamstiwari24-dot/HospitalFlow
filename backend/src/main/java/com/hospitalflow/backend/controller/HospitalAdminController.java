package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.Hospital;
import com.hospitalflow.backend.repository.HospitalRepository;
import com.hospitalflow.backend.service.HospitalSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospital-admin")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class HospitalAdminController {

    private final HospitalRepository hospitalRepository;
    private final HospitalSecurityService hospitalSecurityService;

    public HospitalAdminController(
            HospitalRepository hospitalRepository,
            HospitalSecurityService hospitalSecurityService
    ) {
        this.hospitalRepository = hospitalRepository;
        this.hospitalSecurityService = hospitalSecurityService;
    }

    /**
     * Get the hospital belonging to the logged-in Hospital Admin.
     */
    @GetMapping("/hospital")
    public ResponseEntity<?> getMyHospital(
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            return hospitalRepository.findById(hospitalId)
                    .map(ResponseEntity::ok)
                    .orElseGet(
                            () -> ResponseEntity.notFound().build()
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }


    /**
     * Secure hospital-by-ID endpoint.
     *
     * A Hospital Admin can access only the hospital
     * associated with their JWT.
     */
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<?> getHospitalById(
            @PathVariable Long hospitalId,
            Authentication authentication
    ) {

        try {

            boolean belongsToHospital =
                    hospitalSecurityService.belongsToHospital(
                            authentication,
                            hospitalId
                    );

            if (!belongsToHospital) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You are not authorized to access this hospital."
                        );
            }

            return hospitalRepository.findById(hospitalId)
                    .map(ResponseEntity::ok)
                    .orElseGet(
                            () -> ResponseEntity.notFound().build()
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }
}