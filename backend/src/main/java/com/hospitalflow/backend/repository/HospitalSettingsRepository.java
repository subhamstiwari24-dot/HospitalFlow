package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.HospitalSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalSettingsRepository extends JpaRepository<HospitalSettings, Long> {
    Optional<HospitalSettings> findByHospital_Id(Long hospitalId);
}