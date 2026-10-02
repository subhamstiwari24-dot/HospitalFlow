package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmployeeIdIgnoreCase(String employeeId);
}