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
import java.util.Locale;
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
        return registrationRepository.findByStatusOrderBySubmissionDateDesc(
                normalizeStatus(status)
        );
    }

    // Get registration by ID
    public Optional<HospitalRegistration> getRegistrationById(Long id) {
        return registrationRepository.findById(id);
    }

    // Create new hospital registration
    public HospitalRegistration createRegistration(
            HospitalRegistration registration
    ) {
        if (registration == null) {
            throw new IllegalArgumentException(
                    "Registration details are required."
            );
        }

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

        // Always initialize a new registration as pending.
        registration.setStatus("PENDING");
        registration.setVerificationStatus("PENDING");
        registration.setReviewNotes(null);
        registration.setReviewedAt(null);

        if (registration.getSubmissionDate() == null) {
            registration.setSubmissionDate(LocalDateTime.now());
        }

        return registrationRepository.save(registration);
    }

    // Approve hospital registration and create Hospital Admin
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

        String currentStatus = normalizeStatus(
                registration.getStatus()
        );

        if ("APPROVED".equals(currentStatus)) {
            throw new IllegalArgumentException(
                    "This registration is already approved."
            );
        }

        if ("REJECTED".equals(currentStatus)) {
            throw new IllegalArgumentException(
                    "A rejected registration cannot be approved."
            );
        }

        if (!"PENDING".equals(currentStatus)
                && !"UNDER_REVIEW".equals(currentStatus)) {
            throw new IllegalArgumentException(
                    "This registration cannot be approved from its current status."
            );
        }

        String adminEmail = registration.getAdminEmail();

        if (adminEmail == null || adminEmail.isBlank()) {
            adminEmail = registration.getOfficialEmail();
        }

        adminEmail = adminEmail.trim();

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

        Hospital savedHospital = hospitalRepository.save(hospital);

        // Create Hospital Admin account
        User hospitalAdmin = new User();
        hospitalAdmin.setName(registration.getAuthorizedPersonName());
        hospitalAdmin.setEmail(adminEmail);
        hospitalAdmin.setRole("HOSPITAL_ADMIN");
        hospitalAdmin.setHospitalId(savedHospital.getId());
        hospitalAdmin.setEnabled(true);
        hospitalAdmin.setFirstLogin(true);
        hospitalAdmin.setPasswordHash(null);

        userRepository.save(hospitalAdmin);

        // Mark registration approved only after creating both records.
        registration.setStatus("APPROVED");
        registration.setVerificationStatus("APPROVED");
        registration.setReviewNotes(reviewNotes);
        registration.setReviewedAt(LocalDateTime.now());

        return registrationRepository.save(registration);
    }

    // Only allow review/rejection here.
    // APPROVED must go through approveRegistration().
    public Optional<HospitalRegistration> updateStatus(
            Long id,
            String status,
            String reviewNotes
    ) {
        String normalizedStatus = normalizeStatus(status);

        if (!"UNDER_REVIEW".equals(normalizedStatus)
                && !"REJECTED".equals(normalizedStatus)) {
            throw new IllegalArgumentException(
                    "Allowed status updates are UNDER_REVIEW or REJECTED. "
                            + "Use the approval endpoint to approve a registration."
            );
        }

        return registrationRepository.findById(id).map(registration -> {
            String currentStatus = normalizeStatus(
                    registration.getStatus()
            );

            if ("APPROVED".equals(currentStatus)) {
                throw new IllegalArgumentException(
                        "An approved registration cannot be changed."
                );
            }

            if ("REJECTED".equals(currentStatus)) {
                throw new IllegalArgumentException(
                        "A rejected registration cannot be changed."
                );
            }

            if (!"PENDING".equals(currentStatus)
                    && !"UNDER_REVIEW".equals(currentStatus)) {
                throw new IllegalArgumentException(
                        "This registration cannot be updated from its current status."
                );
            }

            registration.setStatus(normalizedStatus);
            registration.setVerificationStatus(normalizedStatus);
            registration.setReviewNotes(reviewNotes);
            registration.setReviewedAt(LocalDateTime.now());

            return registrationRepository.save(registration);
        });
    }

    // Normalize status safely
    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Registration status is required."
            );
        }

        return status.trim().toUpperCase(Locale.ROOT);
    }

    // Delete registration
    public boolean deleteRegistration(Long id) {
        if (!registrationRepository.existsById(id)) {
            return false;
        }

        deleteRegistrationRecord(id);
        return true;
    }

    private void deleteRegistrationRecord(Long id) {
        registrationRepository.deleteById(id);
    }
}