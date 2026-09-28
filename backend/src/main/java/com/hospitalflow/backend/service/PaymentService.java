package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.entity.Payment;
import com.hospitalflow.backend.repository.AppointmentRepository;
import com.hospitalflow.backend.repository.PaymentRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public PaymentService(
            PaymentRepository paymentRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // =====================================================
    // CREATE PAYMENT + RAZORPAY ORDER
    // =====================================================

    @Transactional
    public Payment createPayment(
            Long appointmentId,
            Double amount
    ) {

        Appointment appointment =
                appointmentRepository.findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with id: "
                                                + appointmentId
                                )
                        );

        // Check existing payment
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

        if (razorpayKeyId == null ||
                razorpayKeyId.isBlank() ||
                razorpayKeySecret == null ||
                razorpayKeySecret.isBlank()) {

            throw new IllegalStateException(
                    "Razorpay credentials are not configured."
            );
        }

        /*
         * Razorpay amount is in paise.
         * Example:
         * ₹100 = 10000 paise
         */
        long amountInPaise =
                Math.round(amount * 100);

        String receipt =
                "HF_APPT_" + appointmentId;

        // =================================================
        // RAZORPAY ORDER REQUEST
        // =================================================

        String razorpayUrl =
                "https://api.razorpay.com/v1/orders";

        Map<String, Object> orderRequest =
                new HashMap<>();

        orderRequest.put(
                "amount",
                amountInPaise
        );

        orderRequest.put(
                "currency",
                "INR"
        );

        orderRequest.put(
                "receipt",
                receipt
        );

        orderRequest.put(
                "payment_capture",
                1
        );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.setBasicAuth(
                razorpayKeyId,
                razorpayKeySecret
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        orderRequest,
                        headers
                );

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        razorpayUrl,
                        HttpMethod.POST,
                        request,
                        Map.class
                );

        if (!response.getStatusCode().is2xxSuccessful()) {

            throw new RuntimeException(
                    "Failed to create Razorpay order. HTTP status: "
                            + response.getStatusCode()
            );
        }

        Map responseBody =
                response.getBody();

        if (responseBody == null) {

            throw new RuntimeException(
                    "Razorpay returned an empty response."
            );
        }

        Object razorpayOrderIdObject =
                responseBody.get("id");

        if (razorpayOrderIdObject == null) {

            throw new RuntimeException(
                    "Razorpay order ID was not returned."
            );
        }

        String razorpayOrderId =
                razorpayOrderIdObject.toString();

        // =================================================
        // SAVE PAYMENT
        // =================================================

        Payment payment =
                new Payment();

        payment.setAppointment(
                appointment
        );

        payment.setPatient(
                null
        );

        payment.setAmount(
                amount
        );

        payment.setCurrency(
                "INR"
        );

        payment.setPaymentStatus(
                "PENDING"
        );

        payment.setRazorpayOrderId(
                razorpayOrderId
        );

        payment.setCreatedAt(
                LocalDateTime.now()
        );

        return paymentRepository.save(
                payment
        );
    }

    // =====================================================
    // GET PAYMENT BY ID
    // =====================================================

    public Payment getPayment(
            Long paymentId
    ) {

        return paymentRepository
                .findById(paymentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with id: "
                                        + paymentId
                        )
                );
    }

    // =====================================================
    // GET PAYMENT BY APPOINTMENT
    // =====================================================

    public Payment getPaymentByAppointment(
            Long appointmentId
    ) {

        return paymentRepository
                .findByAppointment_Id(
                        appointmentId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found for appointment: "
                                        + appointmentId
                        )
                );
    }

    // =====================================================
    // VERIFY RAZORPAY PAYMENT
    // =====================================================

    @Transactional
    public Payment verifyPayment(
            Long paymentId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {

        Payment payment =
                getPayment(paymentId);

        if (razorpayPaymentId == null ||
                razorpayPaymentId.isBlank()) {

            throw new IllegalArgumentException(
                    "Razorpay payment ID is required."
            );
        }

        if (razorpaySignature == null ||
                razorpaySignature.isBlank()) {

            throw new IllegalArgumentException(
                    "Razorpay signature is required."
            );
        }

        String razorpayOrderId =
                payment.getRazorpayOrderId();

        if (razorpayOrderId == null ||
                razorpayOrderId.isBlank()) {

            throw new IllegalStateException(
                    "Razorpay order ID is missing for this payment."
            );
        }

        if (razorpayKeySecret == null ||
                razorpayKeySecret.isBlank()) {

            throw new IllegalStateException(
                    "Razorpay secret is not configured."
            );
        }

        String payload =
                razorpayOrderId
                        + "|"
                        + razorpayPaymentId;

        String generatedSignature =
                generateHmacSha256(
                        payload,
                        razorpayKeySecret
                );

        if (!constantTimeEquals(
                generatedSignature,
                razorpaySignature
        )) {

            throw new IllegalArgumentException(
                    "Invalid Razorpay payment signature."
            );
        }

        payment.setPaymentStatus(
                "PAID"
        );

        payment.setRazorpayPaymentId(
                razorpayPaymentId
        );

        payment.setRazorpaySignature(
                razorpaySignature
        );

        payment.setPaidAt(
                LocalDateTime.now()
        );

        return paymentRepository.save(
                payment
        );
    }

    // =====================================================
    // MARK AS PAID
    // =====================================================

    @Transactional
    public Payment markAsPaid(
            Long paymentId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {

        return verifyPayment(
                paymentId,
                razorpayPaymentId,
                razorpaySignature
        );
    }

    // =====================================================
    // MARK AS FAILED
    // =====================================================

    @Transactional
    public Payment markAsFailed(
            Long paymentId
    ) {

        Payment payment =
                getPayment(paymentId);

        payment.setPaymentStatus(
                "FAILED"
        );

        return paymentRepository.save(
                payment
        );
    }

    // =====================================================
    // HMAC SHA256
    // =====================================================

    private String generateHmacSha256(
            String data,
            String secret
    ) {

        try {

            Mac mac =
                    Mac.getInstance(
                            "HmacSHA256"
                    );

            SecretKeySpec secretKey =
                    new SecretKeySpec(
                            secret.getBytes(
                                    StandardCharsets.UTF_8
                            ),
                            "HmacSHA256"
                    );

            mac.init(secretKey);

            byte[] hash =
                    mac.doFinal(
                            data.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            StringBuilder hex = new StringBuilder();

            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }

            return hex.toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to generate payment signature.",
                    e
            );
        }
    }

    // =====================================================
    // CONSTANT-TIME STRING COMPARISON
    // =====================================================

    private boolean constantTimeEquals(
            String first,
            String second
    ) {

        if (first == null ||
                second == null) {

            return false;
        }

        return java.security.MessageDigest
                .isEqual(
                        first.getBytes(
                                StandardCharsets.UTF_8
                        ),
                        second.getBytes(
                                StandardCharsets.UTF_8
                        )
                );
    }
}