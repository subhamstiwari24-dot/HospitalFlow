package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.entity.Payment;
import com.hospitalflow.backend.repository.AppointmentRepository;
import com.hospitalflow.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    @Transactional
    public Payment createPayment(Long appointmentId, Double amount) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Appointment not found with id: " + appointmentId
                        )
                );

        // Prevent duplicate payment record
        Payment existingPayment =
                paymentRepository
                        .findByAppointment_Id(appointmentId)
                        .orElse(null);

        if (existingPayment != null) {
            return existingPayment;
        }

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than 0."
            );
        }

        Payment payment = new Payment();

        payment.setAppointment(appointment);
        payment.setPatient(null);

        payment.setAmount(amount);
        payment.setCurrency("INR");
        payment.setPaymentStatus("PENDING");

        payment.setCreatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    // =====================================================
    // GET PAYMENT BY ID
    // =====================================================

    public Payment getPayment(Long paymentId) {

        return paymentRepository
                .findById(paymentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with id: " + paymentId
                        )
                );
    }

    // =====================================================
    // GET PAYMENT BY APPOINTMENT
    // =====================================================

    public Payment getPaymentByAppointment(Long appointmentId) {

        return paymentRepository
                .findByAppointment_Id(appointmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found for appointment: "
                                        + appointmentId
                        )
                );
    }

    // =====================================================
    // MARK PAYMENT AS PAID
    // =====================================================

    @Transactional
    public Payment markAsPaid(
            Long paymentId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {

        Payment payment = getPayment(paymentId);

        payment.setPaymentStatus("PAID");
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setPaidAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    // =====================================================
    // MARK PAYMENT AS FAILED
    // =====================================================

    @Transactional
    public Payment markAsFailed(Long paymentId) {

        Payment payment = getPayment(paymentId);

        payment.setPaymentStatus("FAILED");

        return paymentRepository.save(payment);
    }
}