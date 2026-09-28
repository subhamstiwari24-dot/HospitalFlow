package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.entity.Payment;
import com.hospitalflow.backend.service.PaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5175"
        }
)
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestParam Long appointmentId,
            @RequestParam Double amount
    ) {

        try {

            Payment payment =
                    paymentService.createPayment(
                            appointmentId,
                            amount
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(payment);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error", e.getMessage()
                    ));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", e.getMessage()
                    ));
        }
    }

    // =====================================================
    // GET PAYMENT BY ID
    // =====================================================

    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(
            @PathVariable Long paymentId
    ) {

        try {

            Payment payment =
                    paymentService.getPayment(paymentId);

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", e.getMessage()
                    ));
        }
    }

    // =====================================================
    // GET PAYMENT BY APPOINTMENT
    // =====================================================

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPaymentByAppointment(
            @PathVariable Long appointmentId
    ) {

        try {

            Payment payment =
                    paymentService.getPaymentByAppointment(
                            appointmentId
                    );

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", e.getMessage()
                    ));
        }
    }

    // =====================================================
    // MARK PAYMENT AS PAID
    // =====================================================

    @PatchMapping("/{paymentId}/paid")
    public ResponseEntity<?> markAsPaid(
            @PathVariable Long paymentId,
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpaySignature
    ) {

        try {

            Payment payment =
                    paymentService.markAsPaid(
                            paymentId,
                            razorpayPaymentId,
                            razorpaySignature
                    );

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", e.getMessage()
                    ));
        }
    }

    // =====================================================
    // MARK PAYMENT AS FAILED
    // =====================================================

    @PatchMapping("/{paymentId}/failed")
    public ResponseEntity<?> markAsFailed(
            @PathVariable Long paymentId
    ) {

        try {

            Payment payment =
                    paymentService.markAsFailed(
                            paymentId
                    );

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", e.getMessage()
                    ));
        }
    }
}