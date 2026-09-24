package com.hospitalflow.backend.service;

import com.hospitalflow.backend.dto.QueuePositionResponse;
import com.hospitalflow.backend.dto.WaitingTimeResponse;
import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.repository.AppointmentRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SimpMessagingTemplate messagingTemplate;

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
    // CREATE APPOINTMENT
    // =========================================================

    public Appointment saveAppointment(Appointment appointment) {

        /*
         * Default priority
         */
        if (appointment.getPriority() == null ||
                appointment.getPriority().isBlank()) {

            appointment.setPriority("NORMAL");
        }

        /*
         * Generate token automatically
         */
        if (appointment.getTokenNumber() == null ||
                appointment.getTokenNumber().isBlank()) {

            Long doctorId =
                    appointment.getDoctor().getId();

            long count =
                    appointmentRepository
                            .countByDoctor_IdAndAppointmentDate(
                                    doctorId,
                                    appointment.getAppointmentDate()
                            );

            appointment.setTokenNumber(
                    String.format("A%02d", count + 1)
            );
        }

        /*
         * Default status
         */
        if (appointment.getStatus() == null ||
                appointment.getStatus().isBlank()) {

            appointment.setStatus("WAITING");
        }

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        /*
         * Send real-time update
         */
        messagingTemplate.convertAndSend(
                "/topic/queue",
                savedAppointment
        );

        return savedAppointment;
    }

    // =========================================================
    // GET WAITING QUEUE
    // =========================================================

    public List<Appointment> getWaitingQueue(
            Long doctorId,
            String appointmentDate) {

        List<Appointment> queue =
                appointmentRepository
                        .findByDoctor_IdAndAppointmentDateAndStatusOrderByPriorityDescIdAsc(
                                doctorId,
                                appointmentDate,
                                "WAITING"
                        );

        /*
         * Business priority:
         *
         * EMERGENCY = 3
         * PRIORITY  = 2
         * NORMAL    = 1
         *
         * Higher priority comes first.
         * If priority is same, older appointment ID comes first.
         */
        queue.sort(
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
        );

        return queue;
    }

    // =========================================================
    // PRIORITY VALUE
    // =========================================================

    private int getPriorityValue(
            String priority) {

        if ("EMERGENCY".equalsIgnoreCase(priority)) {
            return 3;
        }

        if ("PRIORITY".equalsIgnoreCase(priority)) {
            return 2;
        }

        return 1;
    }

    // =========================================================
    // GET QUEUE POSITION
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

        /*
         * If appointment is already completed,
         * it no longer has a queue position.
         */
        if ("COMPLETED".equalsIgnoreCase(
                appointment.getStatus())) {

            return new QueuePositionResponse(
                    appointment.getTokenNumber(),
                    0,
                    0,
                    appointment.getStatus()
            );
        }

        /*
         * If currently being served,
         * position is considered 0.
         */
        if ("IN_PROGRESS".equalsIgnoreCase(
                appointment.getStatus())) {

            return new QueuePositionResponse(
                    appointment.getTokenNumber(),
                    0,
                    0,
                    appointment.getStatus()
            );
        }

        /*
         * Cancelled appointment
         */
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
    // GET WAITING TIME
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

        /*
         * COMPLETED
         *
         * No waiting time after consultation.
         */
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

        /*
         * IN_PROGRESS
         *
         * Patient is currently being served.
         */
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

        /*
         * CANCELLED
         */
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

        /*
         * WAITING
         *
         * Calculate position from the live queue.
         */
        Long doctorId =
                appointment.getDoctor().getId();

        List<Appointment> queue =
                getWaitingQueue(
                        doctorId,
                        appointment.getAppointmentDate()
                );

        int patientsAhead = 0;

        /*
         * Count only patients before
         * this appointment.
         */
        for (Appointment queuedAppointment : queue) {

            if (queuedAppointment
                    .getId()
                    .equals(appointmentId)) {

                break;
            }

            patientsAhead++;
        }

        /*
         * Current prototype:
         *
         * Average consultation = 10 minutes.
         *
         * Later this calculation will be
         * replaced by the HospitalFlow AI service.
         */
        int averageConsultationMinutes = 10;

        int estimatedMinMinutes =
                patientsAhead *
                averageConsultationMinutes;

        int estimatedMaxMinutes =
                estimatedMinMinutes + 10;

        String message =
                "Estimated waiting time based on current OPD queue.";

        return new WaitingTimeResponse(
                appointment.getTokenNumber(),
                patientsAhead,
                estimatedMinMinutes,
                estimatedMaxMinutes,
                message
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

        /*
         * Broadcast status change.
         *
         * Patient frontend receives this through
         * WebSocket and refreshes the live queue.
         */
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

        /*
         * Notify connected clients
         * that queue has changed.
         */
        messagingTemplate.convertAndSend(
                "/topic/queue",
                "Appointment " + id + " deleted"
        );
    }
}