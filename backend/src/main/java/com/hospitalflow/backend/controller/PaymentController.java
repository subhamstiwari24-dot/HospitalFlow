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
    // CREATE PAYMENT + RAZORPAY ORDER
    // =====================================================

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestParam Long appointmentId,
            @RequestParam Double amount,
            @RequestParam(defaultValue = "ONLINE") String paymentMethod
    ) {

        try {

            Payment payment =
                    paymentService.createPayment(
                            appointmentId,
                            amount,
                            paymentMethod
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(payment);

        } catch (IllegalArgumentException e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Invalid payment request"
                            )
                    );

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unknown payment error"
                            )
                    );
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
                    paymentService.getPayment(
                            paymentId
                    );

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Payment not found"
                            )
                    );
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

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Payment not found for appointment"
                            )
                    );
        }
    }


    // =====================================================
    // VERIFY RAZORPAY PAYMENT
    // =====================================================

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestParam Long paymentId,
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpaySignature
    ) {

        try {

            Payment payment =
                    paymentService.verifyPayment(
                            paymentId,
                            razorpayPaymentId,
                            razorpaySignature
                    );

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Payment verification failed"
                            )
                    );
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

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to mark payment as paid"
                            )
                    );
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

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to mark payment as failed"
                            )
                    );
        }
    }


    // =====================================================
    // INITIATE REFUND
    // =====================================================

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<?> initiateRefund(
            @PathVariable Long paymentId
    ) {

        try {

            Payment payment =
                    paymentService.initiateRefund(
                            paymentId
                    );

            return ResponseEntity.ok(payment);

        } catch (IllegalStateException e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Refund cannot be initiated"
                            )
                    );

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Refund failed"
                            )
                    );
        }
    }


    // =====================================================
    // MARK REFUND AS COMPLETED
    // =====================================================

    @PatchMapping("/{paymentId}/refunded")
    public ResponseEntity<?> markRefunded(
            @PathVariable Long paymentId
    ) {

        try {

            Payment payment =
                    paymentService.markRefunded(
                            paymentId
                    );

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to mark refund as completed"
                            )
                    );
        }
    }


    // =====================================================
    // MARK REFUND AS FAILED
    // =====================================================

    @PatchMapping("/{paymentId}/refund-failed")
    public ResponseEntity<?> markRefundFailed(
            @PathVariable Long paymentId
    ) {

        try {

            Payment payment =
                    paymentService.markRefundFailed(
                            paymentId
                    );

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to mark refund as failed"
                            )
                    );
        }
    }
}