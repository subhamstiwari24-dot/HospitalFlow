package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // =====================================================
    // COUNT ALL APPOINTMENTS FOR A DOCTOR ON A DATE
    // =====================================================

    long countByDoctor_IdAndAppointmentDate(
            Long doctorId,
            String appointmentDate
    );


    // =====================================================
    // GET WAITING QUEUE
    // =====================================================

    List<Appointment> findByDoctor_IdAndAppointmentDateAndStatusOrderByPriorityDescIdAsc(
            Long doctorId,
            String appointmentDate,
            String status
    );


    // =====================================================
    // GET PATIENT APPOINTMENTS
    // =====================================================

    List<Appointment> findByPatientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(
            String patientPhone
    );


    // =====================================================
    // CHECK DUPLICATE BOOKING FOR SAME PATIENT
    // =====================================================
    //
    // Same patient
    // + same doctor
    // + same date
    // + same time
    // = duplicate booking
    //
    // CANCELLED appointments are ignored.
    // =====================================================

    boolean existsByDoctor_IdAndAppointmentDateAndAppointmentTimeAndPatientPhoneAndStatusNot(
            Long doctorId,
            String appointmentDate,
            String appointmentTime,
            String patientPhone,
            String status
    );


    // =====================================================
    // GET ALL APPOINTMENTS FOR A DOCTOR ON A DATE
    // =====================================================

    List<Appointment> findByDoctor_IdAndAppointmentDate(
            Long doctorId,
            String appointmentDate
    );


    // =====================================================
    // COUNT ACTIVE BOOKINGS FOR A SPECIFIC SLOT
    // =====================================================
    //
    // Used by SlotService to calculate remaining capacity.
    // CANCELLED appointments are excluded.
    // =====================================================

    long countByDoctor_IdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long doctorId,
            String appointmentDate,
            String appointmentTime,
            String status
    );
}