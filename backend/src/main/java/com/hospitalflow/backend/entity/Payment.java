package com.hospitalflow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    // =====================================================
    // PRIMARY KEY
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // APPOINTMENT
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;


    // =====================================================
    // PATIENT
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;


    // =====================================================
    // PAYMENT DETAILS
    // =====================================================

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency = "INR";

    @Column(nullable = false)
    private String paymentStatus = "PENDING";

    /*
     * Supported payment methods:
     *
     * ONLINE
     * PAY_AT_HOSPITAL
     */
    @Column(
        name = "payment_method",
        nullable = false,
        columnDefinition = "varchar(50) default 'ONLINE'"
    )
    private String paymentMethod = "ONLINE";


    // =====================================================
    // RAZORPAY DETAILS
    // =====================================================

    private String razorpayOrderId;

    private String razorpayPaymentId;

    @Column(columnDefinition = "TEXT")
    private String razorpaySignature;


    // =====================================================
    // PAYMENT TIMESTAMPS
    // =====================================================

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;


    // =====================================================
    // REFUND DETAILS
    // =====================================================

    @Column(name = "refund_status")
    private String refundStatus = "NOT_REQUESTED";

    @Column(name = "razorpay_refund_id")
    private String razorpayRefundId;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Payment() {

        this.createdAt = LocalDateTime.now();

        this.paymentStatus = "PENDING";

        this.paymentMethod = "ONLINE";

        this.refundStatus = "NOT_REQUESTED";
    }


    // =====================================================
    // GETTERS AND SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // =====================================================
    // APPOINTMENT
    // =====================================================

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }


    // =====================================================
    // PATIENT
    // =====================================================

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }


    // =====================================================
    // AMOUNT
    // =====================================================

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }


    // =====================================================
    // CURRENCY
    // =====================================================

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }


    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }


    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }


    // =====================================================
    // RAZORPAY ORDER ID
    // =====================================================

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }


    // =====================================================
    // RAZORPAY PAYMENT ID
    // =====================================================

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }


    // =====================================================
    // RAZORPAY SIGNATURE
    // =====================================================

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }


    // =====================================================
    // CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    // =====================================================
    // PAID AT
    // =====================================================

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }


    // =====================================================
    // REFUND STATUS
    // =====================================================

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }


    // =====================================================
    // RAZORPAY REFUND ID
    // =====================================================

    public String getRazorpayRefundId() {
        return razorpayRefundId;
    }

    public void setRazorpayRefundId(String razorpayRefundId) {
        this.razorpayRefundId = razorpayRefundId;
    }


    // =====================================================
    // REFUNDED AT
    // =====================================================

    public LocalDateTime getRefundedAt() {
        return refundedAt;
    }

    public void setRefundedAt(LocalDateTime refundedAt) {
        this.refundedAt = refundedAt;
    }
}