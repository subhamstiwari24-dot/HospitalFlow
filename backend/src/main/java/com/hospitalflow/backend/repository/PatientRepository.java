package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPhone(String phone);

    Optional<Patient> findByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
}