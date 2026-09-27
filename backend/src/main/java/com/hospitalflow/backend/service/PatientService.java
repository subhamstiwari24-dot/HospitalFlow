package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Patient;
import com.hospitalflow.backend.repository.PatientRepository;
import com.hospitalflow.backend.entity.PendingRegistration;
import com.hospitalflow.backend.repository.PendingRegistrationRepository;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public PatientService(
            PatientRepository patientRepository,
            PendingRegistrationRepository pendingRegistrationRepository
    ) {
        this.patientRepository = patientRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /* ============================================================
       DIRECT PATIENT REGISTRATION
       ============================================================ */

    public Patient registerPatient(
            String fullName,
            Integer age,
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

        if (age == null || age < 1 || age > 120) {
            throw new IllegalArgumentException(
                    "Please enter a valid age"
            );
        }

        Patient patient = new Patient();

        /*
         * Generate HospitalFlow Patient ID.
         *
         * Example:
         * HF-PAT-000001
         * HF-PAT-000002
         * HF-PAT-000003
         */
        long nextId = patientRepository.nextPatientId();

        String patientId = String.format(
                "HF-PAT-%06d",
                nextId
        );

        patient.setPatientId(patientId);

        patient.setFullName(
                fullName.trim()
        );

        patient.setAge(age);

        patient.setPhone(
                phone.trim()
        );

        patient.setEmail(
                email.trim().toLowerCase()
        );

        // Never store the patient's password directly.
        patient.setPasswordHash(
                passwordEncoder.encode(password)
        );

        patient.setActive(true);
        patient.setEmailVerified(true);

        return patientRepository.save(patient);
    }

    /* ============================================================
       SAVE PENDING REGISTRATION
       ============================================================ */

    public void savePendingRegistration(
            String fullName,
            Integer age,
            String phone,
            String email,
            String password
    ) {

        String normalizedEmail =
                email.trim().toLowerCase();

        String normalizedPhone =
                phone.trim();

        if (
                patientRepository.existsByPhone(
                        normalizedPhone
                )
                ||
                patientRepository.existsByEmail(
                        normalizedEmail
                )
                ||
                pendingRegistrationRepository.existsByPhone(
                        normalizedPhone
                )
        ) {

            throw new IllegalArgumentException(
                    "A patient with these details already exists"
            );
        }

        PendingRegistration pending =
                pendingRegistrationRepository
                        .findByEmail(normalizedEmail)
                        .orElseGet(
                                PendingRegistration::new
                        );

        pending.setFullName(
                fullName.trim()
        );

        pending.setAge(age);

        pending.setPhone(
                normalizedPhone
        );

        pending.setEmail(
                normalizedEmail
        );

        pending.setPasswordHash(
                passwordEncoder.encode(password)
        );

        pending.setCreatedAt(
                java.time.LocalDateTime.now()
        );

        pendingRegistrationRepository.save(
                pending
        );
    }

    /* ============================================================
       COMPLETE PENDING REGISTRATION
       ============================================================ */

    @Transactional
    public Patient completePendingRegistration(
            String email
    ) {

        PendingRegistration pending =
                pendingRegistrationRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Registration request not found"
                                )
                        );

        Patient patient =
                registerPatient(
                        pending.getFullName(),
                        pending.getAge(),
                        pending.getPhone(),
                        pending.getEmail(),
                        pending.getPasswordHash(),
                        true
                );

        pendingRegistrationRepository.delete(
                pending
        );

        return patient;
    }

    /* ============================================================
       INTERNAL REGISTRATION METHOD
       ============================================================ */

    private Patient registerPatient(
            String fullName,
            Integer age,
            String phone,
            String email,
            String password,
            boolean alreadyHashed
    ) {

        if (
                patientRepository.existsByPhone(phone)
                ||
                patientRepository.existsByEmail(email)
        ) {

            throw new IllegalArgumentException(
                    "A patient with these details already exists"
            );
        }

        Patient patient = new Patient();

        patient.setPatientId(
                String.format(
                        "HF-PAT-%06d",
                        patientRepository.nextPatientId()
                )
        );

        patient.setFullName(
                fullName.trim()
        );

        patient.setAge(age);

        patient.setPhone(
                phone.trim()
        );

        patient.setEmail(
                email.trim().toLowerCase()
        );

        /*
         * If password is already BCrypt hashed
         * then do not encode it again.
         */
        patient.setPasswordHash(
                alreadyHashed
                        ? password
                        : passwordEncoder.encode(password)
        );

        patient.setActive(true);
        patient.setEmailVerified(true);

        return patientRepository.save(
                patient
        );
    }

    /* ============================================================
       UPDATE PASSWORD
       ============================================================ */

    public void updatePassword(
            String email,
            String newPassword
    ) {

        Patient patient =
                patientRepository.findByEmail(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Patient account not found"
                                )
                        );

        patient.setPasswordHash(
                passwordEncoder.encode(
                        newPassword
                )
        );

        patientRepository.save(
                patient
        );
    }

    /* ============================================================
       UPDATE PATIENT PROFILE
       ============================================================ */

    @Transactional
    public Patient updateProfile(
            String phone,
            String fullName,
            Integer age
    ) {

        Patient patient =
                patientRepository.findByPhone(
                        phone.trim()
                ).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Patient account not found"
                        )
                );

        /*
         * Validate full name
         */
        if (
                fullName == null
                ||
                fullName.trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Full name is required"
            );
        }

        /*
         * Validate age
         */
        if (
                age == null
                ||
                age < 1
                ||
                age > 120
        ) {

            throw new IllegalArgumentException(
                    "Please enter a valid age between 1 and 120"
            );
        }

        /*
         * Update only editable fields.
         *
         * Patient ID, phone and email
         * remain unchanged.
         */
        patient.setFullName(
                fullName.trim()
        );

        patient.setAge(age);

        return patientRepository.save(
                patient
        );
    }

    /* ============================================================
       FIND PATIENT BY PHONE
       ============================================================ */

    public Optional<Patient> findByPhone(
            String phone
    ) {

        return patientRepository.findByPhone(
                phone.trim()
        );
    }

    /* ============================================================
       FIND PATIENT BY EMAIL
       ============================================================ */

    public Optional<Patient> findByEmail(
            String email
    ) {

        return patientRepository.findByEmail(
                email.trim().toLowerCase()
        );
    }

    /* ============================================================
       VERIFY PASSWORD
       ============================================================ */

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