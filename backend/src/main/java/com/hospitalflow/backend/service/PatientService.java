package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Patient;
import com.hospitalflow.backend.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Patient registerPatient(
            String fullName,
            String phone,
            String email,
            String password
    ) {

        if (patientRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException(
                    "A patient with this mobile number already exists"
            );
        }

        if (patientRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "A patient with this email already exists"
            );
        }

        Patient patient = new Patient();

        patient.setFullName(fullName.trim());
        patient.setPhone(phone.trim());
        patient.setEmail(email.trim().toLowerCase());

        // Never store the patient's password directly.
        patient.setPasswordHash(
                passwordEncoder.encode(password)
        );

        patient.setActive(true);

        return patientRepository.save(patient);
    }

    public Optional<Patient> findByPhone(String phone) {
        return patientRepository.findByPhone(phone.trim());
    }

    public boolean verifyPassword(
            String rawPassword,
            String passwordHash
    ) {
        return passwordEncoder.matches(
                rawPassword,
                passwordHash
        );
    }
}