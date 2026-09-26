package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
	Optional<Doctor> findByEmailIgnoreCase(String email);
}