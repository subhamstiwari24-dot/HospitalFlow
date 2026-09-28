package com.hospitalflow.backend.service;

import com.hospitalflow.backend.dto.SlotAvailabilityResponse;
import com.hospitalflow.backend.dto.SlotResponse;
import com.hospitalflow.backend.entity.Doctor;
import com.hospitalflow.backend.repository.AppointmentRepository;
import com.hospitalflow.backend.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class SlotService {

    // Maximum number of patients allowed in one booking slot
    private static final int SLOT_CAPACITY = 10;

    // Slot duration used by HospitalFlow booking system
    private static final int SLOT_DURATION_MINUTES = 30;

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("hh:mm a");

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public SlotService(
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // =====================================================
    // GET AVAILABLE SLOTS
    // =====================================================

    public SlotAvailabilityResponse getAvailableSlots(
            Long doctorId,
            String date
    ) {

        // -------------------------------------------------
        // Validate date
        // -------------------------------------------------

        LocalDate appointmentDate;

        try {

            appointmentDate = LocalDate.parse(date);

        } catch (DateTimeParseException e) {

            throw new IllegalArgumentException(
                    "Invalid date format. Use YYYY-MM-DD."
            );
        }


        // -------------------------------------------------
        // Find doctor
        // -------------------------------------------------

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor not found with id: " + doctorId
                        )
                );


        // -------------------------------------------------
        // Check doctor status
        // -------------------------------------------------

        if (doctor.getStatus() == null ||
                doctor.getStatus().isBlank()) {

            throw new RuntimeException(
                    "Doctor availability status is not configured."
            );
        }


        // -------------------------------------------------
        // Get OPD working hours
        //
        // Example:
        //
        // opdStartTime = 09:00 AM
        // opdEndTime   = 01:00 PM
        //
        // -------------------------------------------------

        String opdStartTime =
                doctor.getOpdStartTime();

        String opdEndTime =
                doctor.getOpdEndTime();


        if (opdStartTime == null ||
                opdStartTime.isBlank() ||
                opdEndTime == null ||
                opdEndTime.isBlank()) {

            throw new RuntimeException(
                    "Doctor OPD working hours are not configured."
            );
        }


        // -------------------------------------------------
        // Parse OPD working hours
        // -------------------------------------------------

        LocalTime startTime =
                parseTime(opdStartTime);

        LocalTime endTime =
                parseTime(opdEndTime);


        if (!startTime.isBefore(endTime)) {

            throw new RuntimeException(
                    "Doctor OPD start time must be before OPD end time."
            );
        }


        // -------------------------------------------------
        // Generate slots
        // -------------------------------------------------

        List<SlotResponse> slots =
                new ArrayList<>();

        LocalTime currentTime =
                startTime;


        while (currentTime.isBefore(endTime)) {

            LocalTime slotEnd =
                    currentTime.plusMinutes(
                            SLOT_DURATION_MINUTES
                    );


            // Don't create a slot that goes beyond
            // the doctor's OPD closing time.

            if (slotEnd.isAfter(endTime)) {
                break;
            }


            String formattedTime =
                    currentTime.format(TIME_FORMAT);


            // -------------------------------------------------
            // Count existing bookings from PostgreSQL
            // -------------------------------------------------

            long bookedCount =
                    appointmentRepository
                            .countByDoctor_IdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                                    doctorId,
                                    date,
                                    formattedTime,
                                    "CANCELLED"
                            );


            // -------------------------------------------------
            // Calculate remaining capacity
            // -------------------------------------------------

            int remaining =
                    Math.max(
                            SLOT_CAPACITY - (int) bookedCount,
                            0
                    );


            boolean available =
                    remaining > 0;


            // -------------------------------------------------
            // Disable past slots for today's date
            // -------------------------------------------------

            if (appointmentDate.equals(
                    LocalDate.now()
            )) {

                LocalTime now =
                        LocalTime.now(
                                ZoneId.systemDefault()
                        );


                if (!currentTime.isAfter(now)) {

                    available = false;
                    remaining = 0;
                }
            }


            // -------------------------------------------------
            // Add slot response
            // -------------------------------------------------

            slots.add(
                    new SlotResponse(
                            formattedTime,
                            formattedTime,
                            available,
                            remaining
                    )
            );


            // Move to next 30-minute slot

            currentTime =
                    currentTime.plusMinutes(
                            SLOT_DURATION_MINUTES
                    );
        }


        // -------------------------------------------------
        // Return response
        // -------------------------------------------------

        return new SlotAvailabilityResponse(
                doctorId,
                date,
                slots
        );
    }


    // =====================================================
    // PARSE TIME
    // =====================================================

    private LocalTime parseTime(String time) {

        try {

            return LocalTime.parse(
                    time.trim().toUpperCase(),
                    TIME_FORMAT
            );

        } catch (DateTimeParseException e) {

            throw new RuntimeException(
                    "Invalid OPD time: " + time +
                    ". Expected format: 09:00 AM"
            );
        }
    }
}