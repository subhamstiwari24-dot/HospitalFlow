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


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

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
        return createPayment(appointmentId, amount, "ONLINE");
    }

    /**
     * Creates a payment record for an appointment.
     *
     * ONLINE:
     * - Creates a Razorpay order.
     * - Payment remains PENDING until Razorpay verification succeeds.
     *
     * PAY_AT_HOSPITAL:
     * - Creates only a local payment record.
     * - Does NOT create a Razorpay order.
     * - Payment remains PENDING until handled by the hospital.
     */
    @Transactional
    public Payment createPayment(
            Long appointmentId,
            Double amount,
            String paymentMethod
    ) {

        Appointment appointment =
                appointmentRepository.findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with id: "
                                                + appointmentId
                                )
                        );


        // =================================================
        // CHECK EXISTING PAYMENT
        // =================================================

        Payment existingPayment =
                paymentRepository
                        .findByAppointment_Id(appointmentId)
                        .orElse(null);

        String normalizedPaymentMethod =
                paymentMethod == null || paymentMethod.isBlank()
                        ? "ONLINE"
                        : paymentMethod.trim().toUpperCase();

        if (!"ONLINE".equals(normalizedPaymentMethod)
                && !"PAY_AT_HOSPITAL".equals(normalizedPaymentMethod)) {

            throw new IllegalArgumentException(
                    "Invalid payment method. Use ONLINE or PAY_AT_HOSPITAL."
            );
        }

        if (existingPayment != null) {

            String existingPaymentMethod =
                    existingPayment.getPaymentMethod();

            if (existingPaymentMethod == null
                    || existingPaymentMethod.isBlank()) {

                existingPaymentMethod = "ONLINE";
            }

            if (!existingPaymentMethod.equalsIgnoreCase(
                    normalizedPaymentMethod)) {

                throw new IllegalStateException(
                        "A payment already exists for this appointment with payment method: "
                                + existingPaymentMethod
                );
            }

            return existingPayment;
        }


        // =================================================
        // VALIDATE AMOUNT
        // =================================================

        if (amount == null || amount <= 0) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than 0."
            );
        }


        // =================================================
        // PAY AT HOSPITAL
        // =================================================

        if ("PAY_AT_HOSPITAL".equals(normalizedPaymentMethod)) {

            Payment payment = new Payment();

            payment.setAppointment(appointment);

            payment.setPatient(null);

            payment.setAmount(amount);

            payment.setCurrency("INR");

            payment.setPaymentMethod("PAY_AT_HOSPITAL");

            payment.setPaymentStatus("PENDING");

            payment.setRefundStatus("NOT_REQUESTED");

            payment.setCreatedAt(LocalDateTime.now());

            // No Razorpay order is created for this method.
            payment.setRazorpayOrderId(null);
            payment.setRazorpayPaymentId(null);
            payment.setRazorpaySignature(null);

            return paymentRepository.save(payment);
        }


        // =================================================
        // CHECK RAZORPAY CREDENTIALS
        // =================================================

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
         *
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

        payment.setPaymentMethod(
                "ONLINE"
        );


        payment.setRazorpayOrderId(
                razorpayOrderId
        );


        payment.setRefundStatus(
                "NOT_REQUESTED"
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

        Payment payment =
                paymentRepository
                        .findByAppointment_Id(
                                appointmentId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for appointment: "
                                                + appointmentId
                                )
                        );

        /*
         * =================================================
         * REFUND STATUS REFRESH
         * =================================================
         *
         * If a refund is currently REFUND_PENDING, check
         * Razorpay using the actual refund ID.
         *
         * Razorpay refund status values are checked directly
         * from /v1/refunds/{refundId}.
         */
        if ("REFUND_PENDING".equalsIgnoreCase(
                payment.getRefundStatus()
        )
                && payment.getRazorpayRefundId() != null
                && !payment.getRazorpayRefundId().isBlank()
                && razorpayKeyId != null
                && !razorpayKeyId.isBlank()
                && razorpayKeySecret != null
                && !razorpayKeySecret.isBlank()) {

            try {

                String refundUrl =
                        "https://api.razorpay.com/v1/refunds/"
                                + payment.getRazorpayRefundId();

                HttpHeaders headers =
                        new HttpHeaders();

                headers.setBasicAuth(
                        razorpayKeyId,
                        razorpayKeySecret
                );

                HttpEntity<Void> request =
                        new HttpEntity<>(headers);

                ResponseEntity<Map> response =
                        restTemplate.exchange(
                                refundUrl,
                                HttpMethod.GET,
                                request,
                                Map.class
                        );

                if (response.getStatusCode().is2xxSuccessful()
                        && response.getBody() != null) {

                    Map responseBody =
                            response.getBody();

                    Object statusObject =
                            responseBody.get("status");

                    String razorpayRefundStatus =
                            statusObject != null
                                    ? statusObject.toString()
                                    : "";

                    /*
                     * Refund has been processed successfully.
                     */
                    if ("processed".equalsIgnoreCase(
                            razorpayRefundStatus
                    )) {

                        payment.setRefundStatus(
                                "REFUNDED"
                        );

                        payment.setRefundedAt(
                                LocalDateTime.now()
                        );

                        return paymentRepository.save(
                                payment
                        );
                    }

                    /*
                     * Refund failed at Razorpay.
                     */
                    if ("failed".equalsIgnoreCase(
                            razorpayRefundStatus
                    )) {

                        payment.setRefundStatus(
                                "REFUND_FAILED"
                        );

                        return paymentRepository.save(
                                payment
                        );
                    }
                }

            } catch (Exception e) {

                /*
                 * Keep REFUND_PENDING if Razorpay cannot be
                 * reached temporarily. The next frontend
                 * polling request can try again.
                 */
                System.err.println(
                        "Unable to refresh Razorpay refund status: "
                                + e.getMessage()
                );
            }
        }

        return payment;
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

        if ("PAY_AT_HOSPITAL".equalsIgnoreCase(
                payment.getPaymentMethod()
        )) {

            throw new IllegalStateException(
                    "Razorpay verification is not applicable for a PAY_AT_HOSPITAL payment."
            );
        }


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


        // =================================================
        // CREATE SIGNATURE PAYLOAD
        // =================================================

        String payload =
                razorpayOrderId
                        + "|"
                        + razorpayPaymentId;


        // =================================================
        // GENERATE HMAC SHA256
        // =================================================

        String generatedSignature =
                generateHmacSha256(
                        payload,
                        razorpayKeySecret
                );


        // =================================================
        // COMPARE SIGNATURES
        // =================================================

        if (!constantTimeEquals(
                generatedSignature,
                razorpaySignature
        )) {

            throw new IllegalArgumentException(
                    "Invalid Razorpay payment signature."
            );
        }


        // =================================================
        // MARK PAYMENT AS PAID
        // =================================================

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
    // INITIATE RAZORPAY REFUND
    // =====================================================

    @Transactional
    public Payment initiateRefund(
            Long paymentId
    ) {

        Payment payment =
                getPayment(paymentId);


        // =================================================
        // CHECK PAYMENT METHOD
        // =================================================

        if ("PAY_AT_HOSPITAL".equalsIgnoreCase(
                payment.getPaymentMethod()
        )) {

            throw new IllegalStateException(
                    "Refund is not applicable because this appointment uses PAY_AT_HOSPITAL."
            );
        }


        // =================================================
        // CHECK PAYMENT STATUS
        // =================================================

        if (!"PAID".equalsIgnoreCase(
                payment.getPaymentStatus()
        )) {

            throw new IllegalStateException(
                    "Refund can only be initiated for a PAID payment."
            );
        }


        // =================================================
        // CHECK RAZORPAY PAYMENT ID
        // =================================================

        String razorpayPaymentId =
                payment.getRazorpayPaymentId();


        if (razorpayPaymentId == null ||
                razorpayPaymentId.isBlank()) {

            throw new IllegalStateException(
                    "Razorpay payment ID is missing."
            );
        }


        // =================================================
        // DUPLICATE REFUND PROTECTION
        // =================================================

        String refundStatus =
                payment.getRefundStatus();


        if ("REFUND_PENDING".equalsIgnoreCase(
                refundStatus
        )) {

            throw new IllegalStateException(
                    "Refund has already been initiated for this payment."
            );
        }


        if ("REFUNDED".equalsIgnoreCase(
                refundStatus
        )) {

            throw new IllegalStateException(
                    "This payment has already been refunded."
            );
        }


        // =================================================
        // CHECK RAZORPAY CREDENTIALS
        // =================================================

        if (razorpayKeyId == null ||
                razorpayKeyId.isBlank() ||
                razorpayKeySecret == null ||
                razorpayKeySecret.isBlank()) {

            throw new IllegalStateException(
                    "Razorpay credentials are not configured."
            );
        }


        // =================================================
        // MARK REFUND AS PENDING
        // =================================================

        payment.setRefundStatus(
                "REFUND_PENDING"
        );


        paymentRepository.save(
                payment
        );


        // =================================================
        // RAZORPAY REFUND URL
        // =================================================

        String refundUrl =
                "https://api.razorpay.com/v1/payments/"
                        + razorpayPaymentId
                        + "/refund";


        // =================================================
        // REFUND REQUEST
        // =================================================

        Map<String, Object> refundRequest =
                new HashMap<>();


        /*
         * Full refund.
         *
         * Example:
         * ₹100 = 10000 paise
         */

        long refundAmountInPaise =
                Math.round(
                        payment.getAmount() * 100
                );


        refundRequest.put(
                "amount",
                refundAmountInPaise
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
                        refundRequest,
                        headers
                );


        try {

            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            refundUrl,
                            HttpMethod.POST,
                            request,
                            Map.class
                    );


            if (!response.getStatusCode().is2xxSuccessful()) {

                payment.setRefundStatus(
                        "REFUND_FAILED"
                );


                paymentRepository.save(
                        payment
                );


                throw new RuntimeException(
                        "Razorpay refund failed. HTTP status: "
                                + response.getStatusCode()
                );
            }


            Map responseBody =
                    response.getBody();


            if (responseBody == null) {

                payment.setRefundStatus(
                        "REFUND_FAILED"
                );


                paymentRepository.save(
                        payment
                );


                throw new RuntimeException(
                        "Razorpay returned an empty refund response."
                );
            }


            // =================================================
            // GET RAZORPAY REFUND ID
            // =================================================

            Object refundIdObject =
                    responseBody.get("id");


            if (refundIdObject == null) {

                payment.setRefundStatus(
                        "REFUND_FAILED"
                );


                paymentRepository.save(
                        payment
                );


                throw new RuntimeException(
                        "Razorpay refund ID was not returned."
                );
            }


            String razorpayRefundId =
                    refundIdObject.toString();


            // =================================================
            // SAVE REFUND INFORMATION
            // =================================================

            payment.setRazorpayRefundId(
                    razorpayRefundId
            );


            /*
             * Razorpay accepted the refund request.
             * We keep REFUND_PENDING until the refund
             * is actually processed/confirmed.
             */

            payment.setRefundStatus(
                    "REFUND_PENDING"
            );


            return paymentRepository.save(
                    payment
            );


        } catch (RuntimeException e) {

            /*
             * If our own validation/error occurred,
             * make sure failed refund state is saved.
             */

            if (!"REFUNDED".equalsIgnoreCase(
                    payment.getRefundStatus()
            )) {

                payment.setRefundStatus(
                        "REFUND_FAILED"
                );


                paymentRepository.save(
                        payment
                );
            }


            throw e;
        }
    }


    // =====================================================
    // MARK REFUND AS COMPLETED
    // =====================================================

    @Transactional
    public Payment markRefunded(
            Long paymentId
    ) {

        Payment payment =
                getPayment(paymentId);


        if (!"REFUND_PENDING".equalsIgnoreCase(
                payment.getRefundStatus()
        )) {

            throw new IllegalStateException(
                    "Payment is not in REFUND_PENDING state."
            );
        }


        payment.setRefundStatus(
                "REFUNDED"
        );


        payment.setRefundedAt(
                LocalDateTime.now()
        );


        return paymentRepository.save(
                payment
        );
    }


    // =====================================================
    // MARK REFUND AS FAILED
    // =====================================================

    @Transactional
    public Payment markRefundFailed(
            Long paymentId
    ) {

        Payment payment =
                getPayment(paymentId);


        payment.setRefundStatus(
                "REFUND_FAILED"
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


            mac.init(
                    secretKey
            );


            byte[] hash =
                    mac.doFinal(
                            data.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );


            // =================================================
            // RAZORPAY SIGNATURE = HEX
            // =================================================

            StringBuilder hex =
                    new StringBuilder(
                            hash.length * 2
                    );


            for (byte b : hash) {

                hex.append(
                        String.format(
                                "%02x",
                                b & 0xff
                        )
                );
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