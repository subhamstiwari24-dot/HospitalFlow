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
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Doctor saveDoctor(Doctor doctor) {
        if (doctor.getEmail() != null) {
            doctor.setEmail(doctor.getEmail().trim().toLowerCase());
        }
        if (doctor.getPasswordHash() != null && !doctor.getPasswordHash().startsWith("$2")) {
            doctor.setPasswordHash(passwordEncoder.encode(doctor.getPasswordHash()));
        }
        return doctorRepository.save(doctor);
    }

    public Optional<Doctor> authenticate(String identifier, String password) {
        Optional<Doctor> doctor = findByIdentifier(identifier);
        return doctor.filter(value -> value.getPasswordHash() != null
                && passwordEncoder.matches(password, value.getPasswordHash()));
    }

    private Optional<Doctor> findByIdentifier(String identifier) {
        String value = identifier.trim();
        try {
            return doctorRepository.findById(Long.parseLong(value));
        } catch (NumberFormatException ignored) {
            return doctorRepository.findByEmailIgnoreCase(value);
        }
    }

    public Optional<Doctor> updateDoctor(Long id, Doctor updatedDoctor) {

        return doctorRepository.findById(id).map(existingDoctor -> {

            existingDoctor.setName(updatedDoctor.getName());
            existingDoctor.setSpecialization(updatedDoctor.getSpecialization());
            existingDoctor.setQualification(updatedDoctor.getQualification());
            existingDoctor.setExperience(updatedDoctor.getExperience());
            existingDoctor.setStatus(updatedDoctor.getStatus());
            existingDoctor.setConsultationTime(updatedDoctor.getConsultationTime());

            if (updatedDoctor.getEmail() != null) {
                existingDoctor.setEmail(updatedDoctor.getEmail().trim().toLowerCase());
            }

            if (updatedDoctor.getPasswordHash() != null && !updatedDoctor.getPasswordHash().isBlank()) {
                existingDoctor.setPasswordHash(passwordEncoder.encode(updatedDoctor.getPasswordHash()));
            }

            if (updatedDoctor.getHospital() != null) {
                existingDoctor.setHospital(updatedDoctor.getHospital());
            }

            if (updatedDoctor.getDepartment() != null) {
                existingDoctor.setDepartment(updatedDoctor.getDepartment());
            }

            return doctorRepository.save(existingDoctor);
        });
    }

    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
}