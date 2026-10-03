package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // Get all departments of a specific hospital
    List<Department> findByHospital_Id(Long hospitalId);

    // Get a department only if it belongs to the hospital
    Optional<Department> findByIdAndHospital_Id(
            Long id,
            Long hospitalId
    );
}