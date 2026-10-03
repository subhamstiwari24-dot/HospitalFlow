package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.Department;
import com.hospitalflow.backend.entity.Hospital;
import com.hospitalflow.backend.repository.DepartmentRepository;
import com.hospitalflow.backend.repository.HospitalRepository;
import com.hospitalflow.backend.service.HospitalSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital-admin/departments")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class HospitalAdminDepartmentController {

    private final DepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;
    private final HospitalSecurityService hospitalSecurityService;

    public HospitalAdminDepartmentController(
            DepartmentRepository departmentRepository,
            HospitalRepository hospitalRepository,
            HospitalSecurityService hospitalSecurityService
    ) {
        this.departmentRepository = departmentRepository;
        this.hospitalRepository = hospitalRepository;
        this.hospitalSecurityService = hospitalSecurityService;
    }

    // ==========================================
    // GET ALL DEPARTMENTS OF CURRENT HOSPITAL
    // ==========================================

    @GetMapping
    public ResponseEntity<?> getDepartments(
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            List<Department> departments =
                    departmentRepository.findByHospital_Id(
                            hospitalId
                    );

            return ResponseEntity.ok(departments);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // GET SINGLE DEPARTMENT
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartment(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            return departmentRepository
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
    // CREATE DEPARTMENT
    // ==========================================

    @PostMapping
    public ResponseEntity<?> createDepartment(
            @RequestBody Department department,
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            Hospital hospital =
                    hospitalRepository.findById(hospitalId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Hospital not found."
                                    )
                            );

            /*
             * Ignore hospital information supplied
             * by the request body.
             *
             * Always assign the authenticated
             * Hospital Admin's hospital.
             */
            department.setHospital(hospital);

            Department savedDepartment =
                    departmentRepository.save(department);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedDepartment);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // UPDATE DEPARTMENT
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(
            @PathVariable Long id,
            @RequestBody Department updatedDepartment,
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            Department existingDepartment =
                    departmentRepository
                            .findByIdAndHospital_Id(
                                    id,
                                    hospitalId
                            )
                            .orElse(null);

            if (existingDepartment == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Department not found in your hospital."
                        );
            }

            /*
             * Update only editable department fields.
             *
             * Hospital relation is deliberately preserved.
             */
            existingDepartment.setName(
                    updatedDepartment.getName()
            );

            existingDepartment.setHead(
                    updatedDepartment.getHead()
            );

            existingDepartment.setRooms(
                    updatedDepartment.getRooms()
            );

            existingDepartment.setStatus(
                    updatedDepartment.getStatus()
            );

            existingDepartment.setHospital(
                    existingDepartment.getHospital()
            );

            Department savedDepartment =
                    departmentRepository.save(
                            existingDepartment
                    );

            return ResponseEntity.ok(savedDepartment);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // DELETE DEPARTMENT
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long hospitalId =
                    hospitalSecurityService.getCurrentHospitalId(
                            authentication
                    );

            Department existingDepartment =
                    departmentRepository
                            .findByIdAndHospital_Id(
                                    id,
                                    hospitalId
                            )
                            .orElse(null);

            if (existingDepartment == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Department not found in your hospital."
                        );
            }

            departmentRepository.delete(existingDepartment);

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