package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // =====================================================
    // FIND PAYMENT BY APPOINTMENT
    // =====================================================

    Optional<Payment> findByAppointment_Id(Long appointmentId);

    // =====================================================
    // FIND PAYMENT BY RAZORPAY ORDER
    // =====================================================

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    // =====================================================
    // FIND PAYMENT BY RAZORPAY PAYMENT ID
    // =====================================================

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    // =====================================================
    // FIND PATIENT PAYMENTS
    // =====================================================

    java.util.List<Payment> findByPatient_IdOrderByCreatedAtDesc(
            Long patientId
    );
}