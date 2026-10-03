package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.Doctor;
import com.hospitalflow.backend.entity.Hospital;
import com.hospitalflow.backend.repository.DoctorRepository;
import com.hospitalflow.backend.repository.HospitalRepository;
import com.hospitalflow.backend.service.DoctorService;
import com.hospitalflow.backend.service.HospitalSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital-admin/doctors")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class HospitalAdminDoctorController {

    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorService doctorService;
    private final HospitalSecurityService hospitalSecurityService;

    public HospitalAdminDoctorController(
            DoctorRepository doctorRepository,
            HospitalRepository hospitalRepository,
            DoctorService doctorService,
            HospitalSecurityService hospitalSecurityService
    ) {
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
        this.doctorService = doctorService;
        this.hospitalSecurityService = hospitalSecurityService;
    }

    // ==========================================
    // GET ALL DOCTORS OF CURRENT HOSPITAL
    // ==========================================

    @GetMapping
    public ResponseEntity<?> getDoctors(
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            List<Doctor> doctors =
                    doctorRepository.findByHospital_Id(
                            hospitalId
                    );

            return ResponseEntity.ok(doctors);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // GET SINGLE DOCTOR
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctor(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            return doctorRepository
                    .findByIdAndHospital_Id(id, hospitalId)
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

    // ==========================================
    // CREATE DOCTOR
    // ==========================================

    @PostMapping
    public ResponseEntity<?> createDoctor(
            @RequestBody Doctor doctor,
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            /*
             * Get the real Hospital entity from database.
             * Hospital ID comes ONLY from JWT.
             */
            Hospital hospital =
                    hospitalRepository.findById(hospitalId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Hospital not found."
                                    )
                            );

            /*
             * Ignore any hospital supplied by the request body.
             * Always assign the authenticated admin's hospital.
             */
            doctor.setHospital(hospital);

            Doctor savedDoctor =
                    doctorService.saveDoctor(doctor);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedDoctor);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // UPDATE DOCTOR
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(
            @PathVariable Long id,
            @RequestBody Doctor updatedDoctor,
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            /*
             * Verify that the doctor belongs to
             * the authenticated admin's hospital.
             */
            Doctor existingDoctor =
                    doctorRepository
                            .findByIdAndHospital_Id(
                                    id,
                                    hospitalId
                            )
                            .orElse(null);

            if (existingDoctor == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Doctor not found in your hospital."
                        );
            }

            /*
             * Prevent request body from changing
             * the doctor to another hospital.
             */
            updatedDoctor.setHospital(
                    existingDoctor.getHospital()
            );

            return doctorService.updateDoctor(
                            id,
                            updatedDoctor
                    )
                    .map(ResponseEntity::ok)
                    .orElse(
                            ResponseEntity
                                    .notFound()
                                    .build()
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // DELETE DOCTOR
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            /*
             * Only delete if the doctor belongs
             * to the current hospital.
             */
            Doctor existingDoctor =
                    doctorRepository
                            .findByIdAndHospital_Id(
                                    id,
                                    hospitalId
                            )
                            .orElse(null);

            if (existingDoctor == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Doctor not found in your hospital."
                        );
            }

            doctorService.deleteDoctor(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }
}