package com.hospitalflow.backend.controller;

import com.hospitalflow.backend.AppointmentController;
import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.entity.Payment;
import com.hospitalflow.backend.service.AppointmentService;
import com.hospitalflow.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/appointments")
public class AdminAppointmentController {

    private final AppointmentService appointmentService;
    private final PaymentService paymentService;
    private final AppointmentController appointmentController;

    public AdminAppointmentController(
            AppointmentService appointmentService,
            PaymentService paymentService,
            AppointmentController appointmentController
    ) {
        this.appointmentService = appointmentService;
        this.paymentService = paymentService;
        this.appointmentController = appointmentController;
    }

    @GetMapping
    public List<Appointment> getAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointment(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/payment")
    public ResponseEntity<?> getPayment(@PathVariable Long id) {
        try {
            Payment payment = paymentService.getPaymentByAppointment(id);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        try {
            return ResponseEntity.ok(appointmentService.updateStatus(id, status));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        return appointmentController.cancelAppointment(id);
    }
}