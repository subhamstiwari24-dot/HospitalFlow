package com.hospitalflow.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospitalflow.backend.entity.Payment;
import com.hospitalflow.backend.repository.PaymentRepository;
import com.hospitalflow.backend.service.PaymentService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/payments")
public class PaymentWebhookController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    // ObjectMapper is created directly
    // so Spring does not need to inject it as a bean
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${razorpay.webhook.secret:}")
    private String webhookSecret;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PaymentWebhookController(
            PaymentService paymentService,
            PaymentRepository paymentRepository
    ) {
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
    }


    // =====================================================
    // RAZORPAY WEBHOOK
    // =====================================================

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(
                    value = "X-Razorpay-Signature",
                    required = false
            ) String razorpaySignature
    ) {

        try {

            // =================================================
            // CHECK WEBHOOK SECRET
            // =================================================

            if (webhookSecret == null ||
                    webhookSecret.isBlank()) {

                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Webhook secret is not configured.");
            }


            // =================================================
            // CHECK SIGNATURE
            // =================================================

            if (razorpaySignature == null ||
                    razorpaySignature.isBlank()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Missing Razorpay webhook signature.");
            }


            // =================================================
            // VERIFY RAZORPAY SIGNATURE
            // =================================================

            String generatedSignature =
                    generateHmacSha256(
                            payload,
                            webhookSecret
                    );


            if (!constantTimeEquals(
                    generatedSignature,
                    razorpaySignature
            )) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid Razorpay webhook signature.");
            }


            // =================================================
            // PARSE PAYLOAD
            // =================================================

            JsonNode root =
                    objectMapper.readTree(payload);


            String event =
                    root.path("event")
                            .asText("");


            // =================================================
            // REFUND PROCESSED
            // =================================================

            if ("refund.processed".equalsIgnoreCase(event)) {

                handleRefundProcessed(root);

                return ResponseEntity.ok(
                        "Refund processed webhook handled."
                );
            }


            // =================================================
            // REFUND FAILED
            // =================================================

            if ("refund.failed".equalsIgnoreCase(event)) {

                handleRefundFailed(root);

                return ResponseEntity.ok(
                        "Refund failed webhook handled."
                );
            }


            // =================================================
            // OTHER EVENTS
            // =================================================

            return ResponseEntity.ok(
                    "Webhook received. Event ignored: " + event
            );


        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Webhook processing failed: "
                                    + e.getMessage()
                    );
        }
    }


    // =====================================================
    // HANDLE REFUND PROCESSED
    // =====================================================

    private void handleRefundProcessed(
            JsonNode root
    ) {

        JsonNode refundEntity =
                root.path("payload")
                        .path("refund")
                        .path("entity");


        String refundId =
                refundEntity
                        .path("id")
                        .asText("");


        String razorpayPaymentId =
                refundEntity
                        .path("payment_id")
                        .asText("");


        if (razorpayPaymentId.isBlank()) {

            throw new IllegalArgumentException(
                    "Razorpay payment ID missing in refund webhook."
            );
        }


        Payment payment =
                paymentRepository
                        .findByRazorpayPaymentId(
                                razorpayPaymentId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for Razorpay payment ID: "
                                                + razorpayPaymentId
                                )
                        );


        // =================================================
        // SAVE REFUND ID IF AVAILABLE
        // =================================================

        if (!refundId.isBlank()) {

            payment.setRazorpayRefundId(
                    refundId
            );
        }


        // =================================================
        // MARK REFUND COMPLETED
        // =================================================

        paymentRepository.save(payment);

        paymentService.markRefunded(
                payment.getId()
        );
    }


    // =====================================================
    // HANDLE REFUND FAILED
    // =====================================================

    private void handleRefundFailed(
            JsonNode root
    ) {

        JsonNode refundEntity =
                root.path("payload")
                        .path("refund")
                        .path("entity");


        String refundId =
                refundEntity
                        .path("id")
                        .asText("");


        String razorpayPaymentId =
                refundEntity
                        .path("payment_id")
                        .asText("");


        if (razorpayPaymentId.isBlank()) {

            throw new IllegalArgumentException(
                    "Razorpay payment ID missing in refund webhook."
            );
        }


        Payment payment =
                paymentRepository
                        .findByRazorpayPaymentId(
                                razorpayPaymentId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for Razorpay payment ID: "
                                                + razorpayPaymentId
                                )
                        );


        // =================================================
        // SAVE REFUND ID IF AVAILABLE
        // =================================================

        if (!refundId.isBlank()) {

            payment.setRazorpayRefundId(
                    refundId
            );
        }


        paymentRepository.save(payment);


        // =================================================
        // MARK REFUND AS FAILED
        // =================================================

        paymentService.markRefundFailed(
                payment.getId()
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
                    "Unable to generate webhook signature.",
                    e
            );
        }
    }


    // =====================================================
    // CONSTANT-TIME COMPARISON
    // =====================================================

    private boolean constantTimeEquals(
            String first,
            String second
    ) {

        if (first == null ||
                second == null) {

            return false;
        }


        return java.security.MessageDigest.isEqual(
                first.getBytes(
                        StandardCharsets.UTF_8
                ),
                second.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }
}