package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.HospitalRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HospitalRegistrationRepository
        extends JpaRepository<HospitalRegistration, Long> {

    List<HospitalRegistration> findByStatusOrderBySubmissionDateDesc(
            String status
    );

    Optional<HospitalRegistration> findByRegistrationNumber(
            String registrationNumber
    );

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByOfficialEmail(String officialEmail);
}