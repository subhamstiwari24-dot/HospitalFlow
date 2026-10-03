package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Hospital;
import com.hospitalflow.backend.entity.HospitalRegistration;
import com.hospitalflow.backend.entity.User;
import com.hospitalflow.backend.repository.HospitalRegistrationRepository;
import com.hospitalflow.backend.repository.HospitalRepository;
import com.hospitalflow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class HospitalRegistrationService {

    private final HospitalRegistrationRepository registrationRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    public HospitalRegistrationService(
            HospitalRegistrationRepository registrationRepository,
            HospitalRepository hospitalRepository,
            UserRepository userRepository
    ) {
        this.registrationRepository = registrationRepository;
        this.hospitalRepository = hospitalRepository;
        this.userRepository = userRepository;
    }

    // Get all registrations
    public List<HospitalRegistration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    // Get registrations by status
    public List<HospitalRegistration> getRegistrationsByStatus(String status) {
        return registrationRepository.findByStatusOrderBySubmissionDateDesc(status);
    }

    // Get registration by ID
    public Optional<HospitalRegistration> getRegistrationById(Long id) {
        return registrationRepository.findById(id);
    }

    // Create new hospital registration
    public HospitalRegistration createRegistration(
            HospitalRegistration registration
    ) {

        if (registrationRepository.existsByRegistrationNumber(
                registration.getRegistrationNumber()
        )) {
            throw new IllegalArgumentException(
                    "Registration number already exists."
            );
        }

        if (registrationRepository.existsByOfficialEmail(
                registration.getOfficialEmail()
        )) {
            throw new IllegalArgumentException(
                    "Official email already exists."
            );
        }

        registration.setStatus("PENDING");
        registration.setVerificationStatus("PENDING");

        if (registration.getSubmissionDate() == null) {
            registration.setSubmissionDate(LocalDateTime.now());
        }

        registration.setReviewedAt(null);

        return registrationRepository.save(registration);
    }

    // Approve hospital registration
    @Transactional
    public HospitalRegistration approveRegistration(
            Long id,
            String reviewNotes
    ) {

        HospitalRegistration registration =
                registrationRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Hospital registration not found."
                                )
                        );

        // Prevent approving an already approved registration
        if ("APPROVED".equalsIgnoreCase(registration.getStatus())) {
            throw new IllegalArgumentException(
                    "This registration is already approved."
            );
        }

        // Prevent approving a rejected registration
        if ("REJECTED".equalsIgnoreCase(registration.getStatus())) {
            throw new IllegalArgumentException(
                    "A rejected registration cannot be approved."
            );
        }

        // Decide which email will be used for Hospital Admin
        String adminEmail = registration.getAdminEmail();

        if (adminEmail == null || adminEmail.isBlank()) {
            adminEmail = registration.getOfficialEmail();
        }

        // Check whether a user with this email already exists
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            throw new IllegalArgumentException(
                    "A user with this admin email already exists."
            );
        }

        // Create Hospital
        Hospital hospital = new Hospital();

        hospital.setName(registration.getHospitalName());
        hospital.setAddress(registration.getAddress());
        hospital.setCity(registration.getCity());
        hospital.setState(registration.getState());
        hospital.setPincode(registration.getPincode());
        hospital.setPhone(registration.getContactNumber());
        hospital.setEmail(registration.getOfficialEmail());
        hospital.setDescription(registration.getDescription());
        hospital.setActive(true);

        Hospital savedHospital =
                hospitalRepository.save(hospital);

        // Create Hospital Admin account
        User hospitalAdmin = new User();

        hospitalAdmin.setName(
                registration.getAuthorizedPersonName()
        );

        hospitalAdmin.setEmail(adminEmail);

        hospitalAdmin.setRole("HOSPITAL_ADMIN");

        hospitalAdmin.setHospitalId(
                savedHospital.getId()
        );

        hospitalAdmin.setEnabled(true);

        // First login will require password setup
        hospitalAdmin.setFirstLogin(true);

        // Password will be created during first-login setup
        hospitalAdmin.setPasswordHash(null);

        userRepository.save(hospitalAdmin);

        // Update registration
        registration.setStatus("APPROVED");

        registration.setVerificationStatus("APPROVED");

        registration.setReviewNotes(reviewNotes);

        registration.setReviewedAt(
                LocalDateTime.now()
        );

        return registrationRepository.save(registration);
    }

    // Update registration status
    public Optional<HospitalRegistration> updateStatus(
            Long id,
            String status,
            String reviewNotes
    ) {

        return registrationRepository.findById(id)
                .map(registration -> {

                    registration.setStatus(status);

                    registration.setReviewNotes(reviewNotes);

                    registration.setReviewedAt(
                            LocalDateTime.now()
                    );

                    if ("APPROVED".equalsIgnoreCase(status)) {
                        registration.setVerificationStatus("APPROVED");
                    }

                    if ("REJECTED".equalsIgnoreCase(status)) {
                        registration.setVerificationStatus("REJECTED");
                    }

                    if ("UNDER_REVIEW".equalsIgnoreCase(status)) {
                        registration.setVerificationStatus("UNDER_REVIEW");
                    }

                    return registrationRepository.save(
                            registration
                    );
                });
    }

    // Delete registration
    public boolean deleteRegistration(Long id) {

        if (!registrationRepository.existsById(id)) {
            return false;
        }

        registrationRepository.deleteById(id);

        return true;
    }
}