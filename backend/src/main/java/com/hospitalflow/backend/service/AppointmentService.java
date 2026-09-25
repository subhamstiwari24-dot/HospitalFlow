package com.hospitalflow.backend.service;

import com.hospitalflow.backend.dto.QueuePositionResponse;
import com.hospitalflow.backend.dto.WaitingTimeResponse;
import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.repository.AppointmentRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Python AI Service
    private final RestClient aiClient =
            RestClient.create("http://127.0.0.1:8000");

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            SimpMessagingTemplate messagingTemplate) {

        this.appointmentRepository = appointmentRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // =========================================================
    // GET ALL APPOINTMENTS
    // =========================================================

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // =========================================================
    // GET APPOINTMENT BY ID
    // =========================================================

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    // =========================================================
    // CREATE / SAVE APPOINTMENT
    // =========================================================

    public Appointment saveAppointment(Appointment appointment) {

        // Default priority
        if (appointment.getPriority() == null ||
                appointment.getPriority().isBlank()) {

            appointment.setPriority("NORMAL");
        }

        // =====================================================
        // GENERATE TOKEN AUTOMATICALLY
        // =====================================================
        //
        // Old logic was:
        //
        // count + 1
        //
        // That can create duplicate tokens if old records,
        // deleted records, or manually modified records exist.
        //
        // New logic:
        // Find the highest existing token for the same
        // doctor + appointment date and generate the next one.
        // =====================================================

        if (appointment.getTokenNumber() == null ||
                appointment.getTokenNumber().isBlank()) {

            Long doctorId =
                    appointment.getDoctor().getId();

            String appointmentDate =
                    appointment.getAppointmentDate();

            int nextTokenNumber =
                    generateNextTokenNumber(
                            doctorId,
                            appointmentDate
                    );

            appointment.setTokenNumber(
                    String.format(
                            "A%02d",
                            nextTokenNumber
                    )
            );
        }

        // Default status
        if (appointment.getStatus() == null ||
                appointment.getStatus().isBlank()) {

            appointment.setStatus("WAITING");
        }

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        // Real-time update
        messagingTemplate.convertAndSend(
                "/topic/queue",
                savedAppointment
        );

        return savedAppointment;
    }

    // =========================================================
    // GENERATE NEXT TOKEN NUMBER
    // =========================================================

    private int generateNextTokenNumber(
            Long doctorId,
            String appointmentDate) {

        List<Appointment> existingAppointments =
                appointmentRepository.findAll();

        int highestTokenNumber = 0;

        for (Appointment existingAppointment :
                existingAppointments) {

            // Doctor check
            if (existingAppointment.getDoctor() == null ||
                    existingAppointment.getDoctor().getId() == null) {

                continue;
            }

            if (!existingAppointment
                    .getDoctor()
                    .getId()
                    .equals(doctorId)) {

                continue;
            }

            // Date check
            if (existingAppointment.getAppointmentDate() == null ||
                    !existingAppointment
                            .getAppointmentDate()
                            .equals(appointmentDate)) {

                continue;
            }

            // Token check
            String token =
                    existingAppointment.getTokenNumber();

            if (token == null ||
                    token.isBlank()) {

                continue;
            }

            // Expected format: A01, A02, A03...
            try {

                if (token.toUpperCase().startsWith("A")) {

                    int tokenNumber =
                            Integer.parseInt(
                                    token.substring(1)
                            );

                    if (tokenNumber > highestTokenNumber) {

                        highestTokenNumber =
                                tokenNumber;
                    }
                }

            } catch (NumberFormatException ignored) {

                // Ignore invalid token formats.
            }
        }

        return highestTokenNumber + 1;
    }

    // =========================================================
    // GET ACTIVE QUEUE
    // =========================================================
    //
    // Active queue includes:
    //   WAITING
    //   IN_PROGRESS
    //
    // Completed / skipped / cancelled appointments
    // are excluded.
    //
    // This is important because the currently serving
    // patient must remain visible in the live queue.
    // =========================================================

    public List<Appointment> getWaitingQueue(
            Long doctorId,
            String appointmentDate) {

        List<Appointment> queue =
                appointmentRepository.findAll()
                        .stream()
                        .filter(appointment ->
                                appointment.getDoctor() != null
                                        && appointment.getDoctor()
                                        .getId()
                                        .equals(doctorId)
                        )
                        .filter(appointment ->
                                appointmentDate.equals(
                                        appointment.getAppointmentDate()
                                )
                        )
                        .filter(appointment -> {

                            String status =
                                    appointment.getStatus();

                            return "WAITING".equalsIgnoreCase(status)
                                    || "IN_PROGRESS".equalsIgnoreCase(status);
                        })
                        .sorted(
                                Comparator
                                        .comparing(
                                                Appointment::getPriority,
                                                Comparator.comparingInt(
                                                        this::getPriorityValue
                                                ).reversed()
                                        )
                                        .thenComparing(
                                                Appointment::getId
                                        )
                        )
                        .toList();

        return queue;
    }

    // =========================================================
    // PRIORITY VALUE
    // =========================================================

    private int getPriorityValue(String priority) {

        if ("EMERGENCY".equalsIgnoreCase(priority)) {
            return 3;
        }

        if ("PRIORITY".equalsIgnoreCase(priority)) {
            return 2;
        }

        return 1;
    }

    // =========================================================
    // QUEUE POSITION
    // =========================================================

    public QueuePositionResponse getQueuePosition(
            Long appointmentId) {

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found"
                                )
                        );

        // Completed appointment
        if ("COMPLETED".equalsIgnoreCase(
                appointment.getStatus())) {

            return new QueuePositionResponse(
                    appointment.getTokenNumber(),
                    0,
                    0,
                    appointment.getStatus()
            );
        }

        // Currently being served
        if ("IN_PROGRESS".equalsIgnoreCase(
                appointment.getStatus())) {

            return new QueuePositionResponse(
                    appointment.getTokenNumber(),
                    0,
                    0,
                    appointment.getStatus()
            );
        }

        // Cancelled appointment
        if ("CANCELLED".equalsIgnoreCase(
                appointment.getStatus())) {

            return new QueuePositionResponse(
                    appointment.getTokenNumber(),
                    0,
                    0,
                    appointment.getStatus()
            );
        }

        Long doctorId =
                appointment.getDoctor().getId();

        List<Appointment> queue =
                getWaitingQueue(
                        doctorId,
                        appointment.getAppointmentDate()
                );

        int position = 1;

        for (int i = 0; i < queue.size(); i++) {

            if (queue.get(i)
                    .getId()
                    .equals(appointmentId)) {

                position = i + 1;
                break;
            }
        }

        int patientsAhead =
                position - 1;

        return new QueuePositionResponse(
                appointment.getTokenNumber(),
                position,
                patientsAhead,
                appointment.getStatus()
        );
    }

    // =========================================================
    // AI WAITING-TIME PREDICTION
    // =========================================================

    public WaitingTimeResponse getWaitingTime(
            Long appointmentId) {

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found"
                                )
                        );

        // -----------------------------------------------------
        // COMPLETED
        // -----------------------------------------------------

        if ("COMPLETED".equalsIgnoreCase(
                appointment.getStatus())) {

            return new WaitingTimeResponse(
                    appointment.getTokenNumber(),
                    0,
                    0,
                    0,
                    "Consultation completed."
            );
        }

        // -----------------------------------------------------
        // IN PROGRESS
        // -----------------------------------------------------

        if ("IN_PROGRESS".equalsIgnoreCase(
                appointment.getStatus())) {

            return new WaitingTimeResponse(
                    appointment.getTokenNumber(),
                    0,
                    0,
                    10,
                    "Consultation is currently in progress."
            );
        }

        // -----------------------------------------------------
        // CANCELLED
        // -----------------------------------------------------

        if ("CANCELLED".equalsIgnoreCase(
                appointment.getStatus())) {

            return new WaitingTimeResponse(
                    appointment.getTokenNumber(),
                    0,
                    0,
                    0,
                    "Appointment cancelled."
            );
        }

        // -----------------------------------------------------
        // CURRENT ACTIVE QUEUE
        // -----------------------------------------------------

        Long doctorId =
                appointment.getDoctor().getId();

        List<Appointment> queue =
                getWaitingQueue(
                        doctorId,
                        appointment.getAppointmentDate()
                );

        int patientsAhead = 0;
        int emergencyPatients = 0;

        for (Appointment queuedAppointment : queue) {

            // Stop when our appointment is reached
            if (queuedAppointment
                    .getId()
                    .equals(appointmentId)) {

                break;
            }

            /*
             * Only patients who are actually ahead
             * should contribute to waiting time.
             *
             * IN_PROGRESS is included as the currently
             * serving patient and therefore contributes
             * to the waiting-time calculation.
             */

            patientsAhead++;

            // Count emergency patients ahead
            if ("EMERGENCY".equalsIgnoreCase(
                    queuedAppointment.getPriority())) {

                emergencyPatients++;
            }
        }

        // -----------------------------------------------------
        // DOCTOR DELAY
        // -----------------------------------------------------

        int doctorDelayMinutes = 0;

        if (appointment.getDoctor() != null &&
                appointment.getDoctor().getStatus() != null) {

            String doctorStatus =
                    appointment.getDoctor()
                            .getStatus();

            if ("DELAYED".equalsIgnoreCase(
                    doctorStatus)) {

                doctorDelayMinutes = 10;
            }
        }

        // -----------------------------------------------------
        // AVERAGE CONSULTATION TIME
        // -----------------------------------------------------

        int averageConsultationMinutes = 10;

        // -----------------------------------------------------
        // CALL PYTHON AI SERVICE
        // -----------------------------------------------------

        try {

            Map<String, Object> requestBody =
                    Map.of(
                            "patients_ahead",
                            patientsAhead,

                            "average_consultation_minutes",
                            averageConsultationMinutes,

                            "emergency_patients",
                            emergencyPatients,

                            "doctor_delay_minutes",
                            doctorDelayMinutes
                    );

            Map<String, Object> aiResponse =
                    aiClient.post()
                            .uri("/predict")
                            .body(requestBody)
                            .retrieve()
                            .body(Map.class);

            if (aiResponse != null) {

                int estimatedMin =
                        ((Number) aiResponse.get(
                                "estimated_min_minutes"
                        )).intValue();

                int estimatedMax =
                        ((Number) aiResponse.get(
                                "estimated_max_minutes"
                        )).intValue();

                String message =
                        String.valueOf(
                                aiResponse.get("message")
                        );

                return new WaitingTimeResponse(
                        appointment.getTokenNumber(),
                        patientsAhead,
                        estimatedMin,
                        estimatedMax,
                        message
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "AI Service unavailable. "
                            + "Using fallback calculation."
            );

            System.out.println(
                    "AI Error: " + e.getMessage()
            );
        }

        // -----------------------------------------------------
        // FALLBACK CALCULATION
        // -----------------------------------------------------

        int estimatedMinMinutes =
                patientsAhead *
                        averageConsultationMinutes;

        int estimatedMaxMinutes =
                estimatedMinMinutes + 10;

        return new WaitingTimeResponse(
                appointment.getTokenNumber(),
                patientsAhead,
                estimatedMinMinutes,
                estimatedMaxMinutes,
                "Estimated waiting time based on current OPD queue."
        );
    }

    // =========================================================
    // UPDATE APPOINTMENT STATUS
    // =========================================================

    public Appointment updateStatus(
            Long appointmentId,
            String status) {

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found"
                                )
                        );

        appointment.setStatus(status);

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        // Broadcast live update
        messagingTemplate.convertAndSend(
                "/topic/queue",
                savedAppointment
        );

        return savedAppointment;
    }

    // =========================================================
    // DELETE APPOINTMENT
    // =========================================================

    public void deleteAppointment(Long id) {

        appointmentRepository.deleteById(id);

        // Notify connected clients
        messagingTemplate.convertAndSend(
                "/topic/queue",
                "Appointment " + id + " deleted"
        );
    }
}