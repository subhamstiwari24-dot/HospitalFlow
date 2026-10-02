package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Hospital;
import com.hospitalflow.backend.entity.HospitalSettings;
import com.hospitalflow.backend.repository.HospitalRepository;
import com.hospitalflow.backend.repository.HospitalSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class HospitalSettingsService {

    private final HospitalRepository hospitalRepository;
    private final HospitalSettingsRepository settingsRepository;

    public HospitalSettingsService(HospitalRepository hospitalRepository, HospitalSettingsRepository settingsRepository) {
        this.hospitalRepository = hospitalRepository;
        this.settingsRepository = settingsRepository;
    }

    @Transactional
    public HospitalSettings getOrCreate() {
        Hospital hospital = hospitalRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No hospital is configured."));
        return settingsRepository.findByHospital_Id(hospital.getId()).orElseGet(() -> {
            HospitalSettings settings = new HospitalSettings();
            settings.setHospital(hospital);
            return settingsRepository.save(settings);
        });
    }

    @Transactional
    public HospitalSettings update(HospitalSettings input) {
        validate(input);
        HospitalSettings current = getOrCreate();
        current.setOpdStartTime(input.getOpdStartTime().trim());
        current.setOpdEndTime(input.getOpdEndTime().trim());
        current.setBookingEnabled(input.getBookingEnabled());
        current.setSameDayBookingEnabled(input.getSameDayBookingEnabled());
        current.setCancellationEnabled(input.getCancellationEnabled());
        current.setDefaultSlotCapacity(input.getDefaultSlotCapacity());
        current.setConsultationDurationMinutes(input.getConsultationDurationMinutes());
        current.setUpdatedAt(LocalDateTime.now());
        return settingsRepository.save(current);
    }

    public void validate(HospitalSettings settings) {
        if (settings.getOpdStartTime() == null || settings.getOpdEndTime() == null
                || settings.getOpdStartTime().isBlank() || settings.getOpdEndTime().isBlank()) {
            throw new IllegalArgumentException("OPD start and end times are required.");
        }
        if (settings.getDefaultSlotCapacity() == null || settings.getDefaultSlotCapacity() <= 0) {
            throw new IllegalArgumentException("Slot capacity must be positive.");
        }
        if (settings.getConsultationDurationMinutes() == null || settings.getConsultationDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Consultation duration must be positive.");
        }
    }
}