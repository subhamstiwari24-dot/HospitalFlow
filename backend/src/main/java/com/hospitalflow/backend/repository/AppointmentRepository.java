package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    long countByDoctor_IdAndAppointmentDate(
            Long doctorId,
            String appointmentDate
    );

    List<Appointment> findByDoctor_IdAndAppointmentDateAndStatusOrderByPriorityDescIdAsc(
            Long doctorId,
            String appointmentDate,
            String status
    );
}