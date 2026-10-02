package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Doctor;
import com.hospitalflow.backend.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();


    // =========================
    // CONSTRUCTOR
    // =========================

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }


    // =========================
    // GET ALL DOCTORS
    // =========================

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }


    // =========================
    // GET DOCTOR BY ID
    // =========================

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }


    // =========================
    // CREATE DOCTOR
    // =========================

    public Doctor saveDoctor(Doctor doctor) {

        // Normalize email
        if (doctor.getEmail() != null) {
            doctor.setEmail(
                    doctor.getEmail()
                            .trim()
                            .toLowerCase()
            );
        }

        // Normalize phone
        if (doctor.getPhone() != null) {
            doctor.setPhone(
                    doctor.getPhone().trim()
            );
        }

        // Normalize name
        if (doctor.getName() != null) {
            doctor.setName(
                    doctor.getName().trim()
            );
        }

        // Normalize specialization
        if (doctor.getSpecialization() != null) {
            doctor.setSpecialization(
                    doctor.getSpecialization().trim()
            );
        }

        // Default consultation fee
        if (doctor.getConsultationFee() == null) {
            doctor.setConsultationFee(0.0);
        }

        // Hash password before saving
        if (doctor.getPasswordHash() != null
                && !doctor.getPasswordHash().isBlank()
                && !doctor.getPasswordHash().startsWith("$2")) {

            doctor.setPasswordHash(
                    passwordEncoder.encode(
                            doctor.getPasswordHash()
                    )
            );
        }

        return doctorRepository.save(doctor);
    }


    // =========================
    // DOCTOR LOGIN
    // =========================

    public Optional<Doctor> authenticate(
            String identifier,
            String password
    ) {

        Optional<Doctor> doctor =
                findByIdentifier(identifier);

        return doctor.filter(
                value ->
                        value.getPasswordHash() != null
                                && passwordEncoder.matches(
                                password,
                                value.getPasswordHash()
                        )
        );
    }


    // =========================
    // FIND DOCTOR BY
    // ID OR EMAIL
    // =========================

    private Optional<Doctor> findByIdentifier(
            String identifier
    ) {

        String value = identifier.trim();

        try {

            // Try doctor ID first
            return doctorRepository.findById(
                    Long.parseLong(value)
            );

        } catch (NumberFormatException ignored) {

            // Otherwise search by email
            return doctorRepository.findByEmailIgnoreCase(
                    value
            );
        }
    }


    // =========================
    // UPDATE DOCTOR
    // =========================

    public Optional<Doctor> updateDoctor(
            Long id,
            Doctor updatedDoctor
    ) {

        return doctorRepository.findById(id)
                .map(existingDoctor -> {

                    // -------------------------
                    // BASIC INFORMATION
                    // -------------------------

                    if (updatedDoctor.getName() != null) {
                        existingDoctor.setName(
                                updatedDoctor.getName().trim()
                        );
                    }

                    if (updatedDoctor.getSpecialization() != null) {
                        existingDoctor.setSpecialization(
                                updatedDoctor
                                        .getSpecialization()
                                        .trim()
                        );
                    }

                    if (updatedDoctor.getQualification() != null) {
                        existingDoctor.setQualification(
                                updatedDoctor.getQualification()
                        );
                    }

                    if (updatedDoctor.getExperience() != null) {
                        existingDoctor.setExperience(
                                updatedDoctor.getExperience()
                        );
                    }


                    // -------------------------
                    // STATUS
                    // -------------------------

                    if (updatedDoctor.getStatus() != null) {
                        existingDoctor.setStatus(
                                updatedDoctor.getStatus()
                        );
                    }


                    // -------------------------
                    // CONSULTATION
                    // -------------------------

                    if (updatedDoctor.getConsultationTime() != null) {
                        existingDoctor.setConsultationTime(
                                updatedDoctor
                                        .getConsultationTime()
                                        .trim()
                        );
                    }

                    if (updatedDoctor.getConsultationFee() != null) {
                        existingDoctor.setConsultationFee(
                                updatedDoctor.getConsultationFee()
                        );
                    }


                    // -------------------------
                    // OPD TIMING
                    // -------------------------

                    if (updatedDoctor.getOpdStartTime() != null) {
                        existingDoctor.setOpdStartTime(
                                updatedDoctor
                                        .getOpdStartTime()
                                        .trim()
                        );
                    }

                    if (updatedDoctor.getOpdEndTime() != null) {
                        existingDoctor.setOpdEndTime(
                                updatedDoctor
                                        .getOpdEndTime()
                                        .trim()
                        );
                    }


                    // -------------------------
                    // PHONE
                    // -------------------------

                    if (updatedDoctor.getPhone() != null) {
                        existingDoctor.setPhone(
                                updatedDoctor
                                        .getPhone()
                                        .trim()
                        );
                    }


                    // -------------------------
                    // ROOM
                    // -------------------------

                    if (updatedDoctor.getRoom() != null) {
                        existingDoctor.setRoom(
                                updatedDoctor
                                        .getRoom()
                                        .trim()
                        );
                    }


                    // -------------------------
                    // EMAIL
                    // -------------------------

                    if (updatedDoctor.getEmail() != null) {

                        String email =
                                updatedDoctor
                                        .getEmail()
                                        .trim()
                                        .toLowerCase();

                        existingDoctor.setEmail(email);
                    }


                    // -------------------------
                    // PASSWORD
                    // -------------------------

                    /*
                     * Password is optional during edit.
                     *
                     * If password is blank/null:
                     * keep existing password.
                     *
                     * If a new plain-text password is
                     * supplied, hash it before saving.
                     */

                    if (updatedDoctor.getPasswordHash() != null
                            && !updatedDoctor
                            .getPasswordHash()
                            .isBlank()) {

                        String newPassword =
                                updatedDoctor
                                        .getPasswordHash();

                        if (!newPassword.startsWith("$2")) {

                            existingDoctor.setPasswordHash(
                                    passwordEncoder.encode(
                                            newPassword
                                    )
                            );

                        } else {

                            existingDoctor.setPasswordHash(
                                    newPassword
                            );
                        }
                    }


                    // -------------------------
                    // HOSPITAL
                    // -------------------------

                    if (updatedDoctor.getHospital() != null) {
                        existingDoctor.setHospital(
                                updatedDoctor.getHospital()
                        );
                    }


                    // -------------------------
                    // DEPARTMENT
                    // -------------------------

                    if (updatedDoctor.getDepartment() != null) {
                        existingDoctor.setDepartment(
                                updatedDoctor.getDepartment()
                        );
                    }


                    // -------------------------
                    // SAVE
                    // -------------------------

                    return doctorRepository.save(
                            existingDoctor
                    );
                });
    }


    // =========================
    // DELETE DOCTOR
    // =========================

    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
}