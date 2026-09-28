package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Patient;
import com.hospitalflow.backend.entity.PendingRegistration;
import com.hospitalflow.backend.repository.PatientRepository;
import com.hospitalflow.backend.repository.PendingRegistrationRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public PatientService(
            PatientRepository patientRepository,
            PendingRegistrationRepository pendingRegistrationRepository
    ) {
        this.patientRepository = patientRepository;
        this.pendingRegistrationRepository =
                pendingRegistrationRepository;
    }

    // =====================================================
    // SAVE / UPDATE PENDING REGISTRATION
    // =====================================================

    public void savePendingRegistration(
            String fullName,
            Integer age,
            String phone,
            String email,
            String password
    ) {

        fullName = fullName == null ? null : fullName.trim();
        phone = phone == null ? null : phone.trim();
        email = email == null
                ? null
                : email.trim().toLowerCase();

        if (fullName == null || fullName.isEmpty()) {
            throw new IllegalArgumentException(
                    "Full name is required"
            );
        }

        if (age == null || age < 1 || age > 120) {
            throw new IllegalArgumentException(
                    "Please enter a valid age"
            );
        }

        if (phone == null || !phone.matches("\\d{10}")) {
            throw new IllegalArgumentException(
                    "Mobile number must be exactly 10 digits"
            );
        }

        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException(
                    "Password must be at least 6 characters"
            );
        }

        // -------------------------------------------------
        // CHECK VERIFIED PATIENT
        // -------------------------------------------------

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

        // -------------------------------------------------
        // FIND EXISTING PENDING REGISTRATION
        // -------------------------------------------------

        Optional<PendingRegistration> existingPending =
                pendingRegistrationRepository.findByEmail(email);

        PendingRegistration pending;

        if (existingPending.isPresent()) {

            pending = existingPending.get();

        } else {

            if (pendingRegistrationRepository.existsByPhone(phone)) {
                throw new IllegalArgumentException(
                        "This mobile number already has a pending registration"
                );
            }

            pending = new PendingRegistration();
            pending.setCreatedAt(LocalDateTime.now());
        }

        // -------------------------------------------------
        // UPDATE PENDING DATA
        // -------------------------------------------------

        pending.setFullName(fullName);
        pending.setAge(age);
        pending.setPhone(phone);
        pending.setEmail(email);

        // Never store plain password
        pending.setPasswordHash(
                passwordEncoder.encode(password)
        );

        pendingRegistrationRepository.save(pending);
    }

    // =====================================================
    // COMPLETE PENDING REGISTRATION
    // =====================================================

    @Transactional
    public Patient completePendingRegistration(
            String email
    ) {

        email = email == null
                ? null
                : email.trim().toLowerCase();

        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        PendingRegistration pending =
                pendingRegistrationRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No pending registration found for this email"
                                )
                        );

        // -------------------------------------------------
        // DOUBLE CHECK EXISTING PATIENT
        // -------------------------------------------------

        if (patientRepository.existsByPhone(
                pending.getPhone()
        )) {
            throw new IllegalArgumentException(
                    "A patient with this mobile number already exists"
            );
        }

        if (patientRepository.existsByEmail(
                pending.getEmail()
        )) {
            throw new IllegalArgumentException(
                    "A patient with this email already exists"
            );
        }

        // -------------------------------------------------
        // CREATE PATIENT
        // -------------------------------------------------

        Patient patient = new Patient();

        patient.setPatientId(
                generatePatientId()
        );

        patient.setFullName(
                pending.getFullName()
        );

        patient.setAge(
                pending.getAge()
        );

        patient.setPhone(
                pending.getPhone()
        );

        patient.setEmail(
                pending.getEmail()
        );

        patient.setPasswordHash(
                pending.getPasswordHash()
        );

        patient.setActive(true);

        patient.setEmailVerified(true);

        patient.setCreatedAt(
                LocalDateTime.now()
        );

        // -------------------------------------------------
        // SAVE PATIENT
        // -------------------------------------------------

        Patient savedPatient =
                patientRepository.save(patient);

        // -------------------------------------------------
        // REMOVE PENDING REGISTRATION
        // -------------------------------------------------

        pendingRegistrationRepository.delete(pending);

        return savedPatient;
    }

    // =====================================================
    // FIND PATIENT BY PHONE
    // =====================================================

    public Optional<Patient> findByPhone(
            String phone
    ) {

        if (phone == null) {
            return Optional.empty();
        }

        return patientRepository.findByPhone(
                phone.trim()
        );
    }

    // =====================================================
    // FIND PATIENT BY EMAIL
    // =====================================================

    public Optional<Patient> findByEmail(
            String email
    ) {

        if (email == null) {
            return Optional.empty();
        }

        return patientRepository.findByEmail(
                email.trim().toLowerCase()
        );
    }

    // =====================================================
    // UPDATE PATIENT PROFILE
    // =====================================================

    public Patient updateProfile(
            String phone,
            String fullName,
            Integer age
    ) {

        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Mobile number is required"
            );
        }

        if (fullName == null ||
                fullName.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Full name is required"
            );
        }

        if (age == null || age < 1 || age > 120) {
            throw new IllegalArgumentException(
                    "Please enter a valid age between 1 and 120"
            );
        }

        Patient patient =
                patientRepository.findByPhone(
                        phone.trim()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Patient profile not found"
                        )
                );

        patient.setFullName(
                fullName.trim()
        );

        patient.setAge(age);

        return patientRepository.save(patient);
    }

    // =====================================================
    // UPDATE PASSWORD
    // =====================================================

    public void updatePassword(
            String email,
            String newPassword
    ) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (newPassword == null ||
                newPassword.length() < 6) {

            throw new IllegalArgumentException(
                    "Password must be at least 6 characters"
            );
        }

        Patient patient =
                patientRepository.findByEmail(
                        email.trim().toLowerCase()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Patient account not found"
                        )
                );

        patient.setPasswordHash(
                passwordEncoder.encode(newPassword)
        );

        patientRepository.save(patient);
    }

    // =====================================================
    // VERIFY PASSWORD
    // =====================================================

    public boolean verifyPassword(
            String rawPassword,
            String passwordHash
    ) {

        if (rawPassword == null ||
                passwordHash == null) {

            return false;
        }

        return passwordEncoder.matches(
                rawPassword,
                passwordHash
        );
    }

    // =====================================================
    // GENERATE UNIQUE PATIENT ID
    // =====================================================

    private String generatePatientId() {

        return "P" +
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 10)
                        .toUpperCase();
    }
}