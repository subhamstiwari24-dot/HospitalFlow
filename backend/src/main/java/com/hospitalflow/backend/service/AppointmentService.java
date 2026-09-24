package com.hospitalflow.backend.service;

import com.hospitalflow.backend.dto.QueuePositionResponse;
import com.hospitalflow.backend.dto.WaitingTimeResponse;
import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public Appointment saveAppointment(Appointment appointment) {

        if (appointment.getPriority() == null ||
                appointment.getPriority().isBlank()) {
            appointment.setPriority("NORMAL");
        }

        if (appointment.getTokenNumber() == null ||
                appointment.getTokenNumber().isBlank()) {

            Long doctorId = appointment.getDoctor().getId();

            long count = appointmentRepository
                    .countByDoctor_IdAndAppointmentDate(
                            doctorId,
                            appointment.getAppointmentDate()
                    );

            appointment.setTokenNumber(
                    String.format("A%02d", count + 1)
            );
        }

        return appointmentRepository.save(appointment);
    }

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

        queue.sort(
                Comparator
                        .comparing(
                                Appointment::getPriority,
                                Comparator.comparingInt(
                                        this::getPriorityValue
                                ).reversed()
                        )
                        .thenComparing(Appointment::getId)
        );

        return queue;
    }

    private int getPriorityValue(String priority) {

        if ("EMERGENCY".equalsIgnoreCase(priority)) {
            return 3;
        }

        if ("PRIORITY".equalsIgnoreCase(priority)) {
            return 2;
        }

        return 1;
    }

    public QueuePositionResponse getQueuePosition(
            Long appointmentId) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));

        Long doctorId = appointment.getDoctor().getId();

        List<Appointment> queue =
                getWaitingQueue(
                        doctorId,
                        appointment.getAppointmentDate()
                );

        int position = 1;

        for (int i = 0; i < queue.size(); i++) {

            if (queue.get(i).getId().equals(appointmentId)) {
                position = i + 1;
                break;
            }
        }

        int patientsAhead = position - 1;

        return new QueuePositionResponse(
                appointment.getTokenNumber(),
                position,
                patientsAhead,
                appointment.getStatus()
        );
    }

    public WaitingTimeResponse getWaitingTime(
            Long appointmentId) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));

        Long doctorId = appointment.getDoctor().getId();

        List<Appointment> queue =
                getWaitingQueue(
                        doctorId,
                        appointment.getAppointmentDate()
                );

        int patientsAhead = 0;

        for (Appointment queuedAppointment : queue) {

            if (queuedAppointment.getId().equals(appointmentId)) {
                break;
            }

            patientsAhead++;
        }

        int averageConsultationMinutes = 10;

        int estimatedMinMinutes =
                patientsAhead * averageConsultationMinutes;

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

    public Appointment updateStatus(
            Long appointmentId,
            String status) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));

        appointment.setStatus(status);

        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}