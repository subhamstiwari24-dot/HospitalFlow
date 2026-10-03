package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmailIgnoreCase(String email);

    // Get doctors belonging to a specific hospital
    List<Doctor> findByHospital_Id(Long hospitalId);

    // Get a specific doctor only if it belongs to the hospital
    Optional<Doctor> findByIdAndHospital_Id(
            Long id,
            Long hospitalId
    );
}