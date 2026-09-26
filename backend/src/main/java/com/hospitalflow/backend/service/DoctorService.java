package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Doctor;
import com.hospitalflow.backend.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

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
        return doctorRepository.save(doctor);
    }

    public Optional<Doctor> updateDoctor(Long id, Doctor updatedDoctor) {

        return doctorRepository.findById(id).map(existingDoctor -> {

            existingDoctor.setName(updatedDoctor.getName());
            existingDoctor.setSpecialization(updatedDoctor.getSpecialization());
            existingDoctor.setQualification(updatedDoctor.getQualification());
            existingDoctor.setExperience(updatedDoctor.getExperience());
            existingDoctor.setStatus(updatedDoctor.getStatus());
            existingDoctor.setConsultationTime(updatedDoctor.getConsultationTime());

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