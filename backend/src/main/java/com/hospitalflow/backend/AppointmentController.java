package com.hospitalflow.backend;

import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.entity.Payment;
import com.hospitalflow.backend.repository.AppointmentRepository;
import com.hospitalflow.backend.repository.HospitalSettingsRepository;
import com.hospitalflow.backend.service.AppointmentService;
import com.hospitalflow.backend.service.PaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final PaymentService paymentService;
        private final HospitalSettingsRepository hospitalSettingsRepository;

    public AppointmentController(
            AppointmentService appointmentService,
            AppointmentRepository appointmentRepository,
            PaymentService paymentService,
            HospitalSettingsRepository hospitalSettingsRepository
    ) {
        this.appointmentService = appointmentService;
        this.appointmentRepository = appointmentRepository;
        this.paymentService = paymentService;
        this.hospitalSettingsRepository = hospitalSettingsRepository;
    }


    // =====================================================
    // GET ALL APPOINTMENTS
    // =====================================================

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }


    // =====================================================
    // GET APPOINTMENT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(
            @PathVariable Long id
    ) {

        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // =====================================================
    // GET PATIENT APPOINTMENTS
    // =====================================================

    @GetMapping("/patient/{phone}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatientPhone(
            @PathVariable String phone
    ) {

        return ResponseEntity.ok(
                appointmentRepository
                        .findByPatientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(
                                phone
                        )
        );
    }


    // =====================================================
    // GET WAITING QUEUE FOR DOCTOR
    // =====================================================

    @GetMapping("/queue")
    public ResponseEntity<List<Appointment>> getQueue(
            @RequestParam Long doctorId,
            @RequestParam String appointmentDate
    ) {

        return ResponseEntity.ok(
                appointmentService.getWaitingQueue(
                        doctorId,
                        appointmentDate
                )
        );
    }


    // =====================================================
    // CREATE APPOINTMENT
    // =====================================================

    @PostMapping
    public Appointment createAppointment(
            @RequestBody Appointment appointment
    ) {

        return appointmentService.saveAppointment(
                appointment
        );
    }


    // =====================================================
    // UPDATE APPOINTMENT
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment updatedAppointment
    ) {

        return appointmentService.getAppointmentById(id)
                .map(existingAppointment -> {

                    existingAppointment.setPatientName(
                            updatedAppointment.getPatientName()
                    );

                    existingAppointment.setPatientPhone(
                            updatedAppointment.getPatientPhone()
                    );

                    existingAppointment.setAppointmentDate(
                            updatedAppointment.getAppointmentDate()
                    );

                    existingAppointment.setAppointmentTime(
                            updatedAppointment.getAppointmentTime()
                    );

                    existingAppointment.setTokenNumber(
                            updatedAppointment.getTokenNumber()
                    );

                    existingAppointment.setStatus(
                            updatedAppointment.getStatus()
                    );

                    existingAppointment.setDoctor(
                            updatedAppointment.getDoctor()
                    );

                    existingAppointment.setHospital(
                            updatedAppointment.getHospital()
                    );

                    existingAppointment.setPriority(
                            updatedAppointment.getPriority()
                    );

                    return ResponseEntity.ok(
                            appointmentService.saveAppointment(
                                    existingAppointment
                            )
                    );
                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }


    // =====================================================
    // UPDATE APPOINTMENT STATUS
    // =====================================================

    /*
     * Used by:
     * Doctor Queue
     * Admin Queue
     * Shared Queue
     *
     * Example:
     * PATCH /api/appointments/23/status?status=IN_PROGRESS
     */

    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        try {

            Appointment updatedAppointment =
                    appointmentService.updateStatus(
                            id,
                            status
                    );

            return ResponseEntity.ok(
                    updatedAppointment
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =====================================================
    // CANCEL APPOINTMENT + INITIATE REFUND
    // =====================================================

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id
    ) {

        try {

            // =================================================
            // 1. FIND APPOINTMENT
            // =================================================

            Appointment appointment =
                    appointmentService
                            .getAppointmentById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Appointment not found with id: "
                                                    + id
                                    )
                            );

                        if (appointment.getHospital() != null) {
                                boolean cancellationEnabled = hospitalSettingsRepository.findByHospital_Id(appointment.getHospital().getId())
                                                .map(settings -> Boolean.TRUE.equals(settings.getCancellationEnabled()))
                                                .orElse(true);
                                if (!cancellationEnabled) {
                                        return ResponseEntity.badRequest().body(Map.of("error", "Appointment cancellation is currently disabled."));
                                }
                        }


            // =================================================
            // 2. CHECK CURRENT STATUS
            // =================================================

            String currentStatus =
                    appointment.getStatus();


            if ("CANCELLED".equalsIgnoreCase(
                    currentStatus
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "Appointment is already cancelled."
                                )
                        );
            }


            if ("COMPLETED".equalsIgnoreCase(
                    currentStatus
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "Completed appointment cannot be cancelled."
                                )
                        );
            }


            if ("IN_PROGRESS".equalsIgnoreCase(
                    currentStatus
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "Appointment is already in progress and cannot be cancelled."
                                )
                        );
            }


            // =================================================
            // 3. SET APPOINTMENT AS CANCELLED
            // =================================================

            appointment.setStatus(
                    "CANCELLED"
            );


            /*
             * IMPORTANT:
             *
             * Do NOT use appointmentService.saveAppointment()
             * here because that method performs booking/
             * duplicate-slot validation.
             *
             * This is an existing appointment whose status
             * is being changed, so save directly through
             * AppointmentRepository.
             */

            Appointment cancelledAppointment =
                    appointmentRepository.save(
                            appointment
                    );


            // =================================================
            // 4. FIND PAYMENT
            // =================================================

            Payment payment = null;

            try {

                payment =
                        paymentService.getPaymentByAppointment(
                                id
                        );

            } catch (RuntimeException ignored) {

                /*
                 * Appointment may exist without payment.
                 *
                 * In that case appointment remains CANCELLED.
                 */
            }


            // =================================================
            // 5. IF PAYMENT EXISTS AND IS PAID
            //    INITIATE REFUND
            // =================================================

            if (payment != null &&
                    "PAID".equalsIgnoreCase(
                            payment.getPaymentStatus()
                    )) {

                Payment refundPayment =
                        paymentService.initiateRefund(
                                payment.getId()
                        );


                Map<String, Object> response =
                        new HashMap<>();


                response.put(
                        "message",
                        "Appointment cancelled and refund initiated."
                );


                response.put(
                        "appointment",
                        cancelledAppointment
                );


                response.put(
                        "payment",
                        refundPayment
                );


                return ResponseEntity.ok(
                        response
                );
            }


            // =================================================
            // 6. NO PAID PAYMENT
            // =================================================

            Map<String, Object> response =
                    new HashMap<>();


            response.put(
                    "message",
                    "Appointment cancelled. No paid payment was found, so no refund was initiated."
            );


            response.put(
                    "appointment",
                    cancelledAppointment
            );


            response.put(
                    "payment",
                    payment
            );


            return ResponseEntity.ok(
                    response
            );


        } catch (IllegalStateException e) {

            e.printStackTrace();


            /*
             * Appointment has already been marked CANCELLED.
             *
             * If refund fails, PaymentService keeps
             * REFUND_FAILED so the refund can be retried.
             */

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to process cancellation/refund."
                            )
                    );


        } catch (RuntimeException e) {

            e.printStackTrace();


            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to cancel appointment."
                            )
                    );
        }
    }


    // =====================================================
    // DELETE APPOINTMENT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Long id
    ) {

        if (
                appointmentService
                        .getAppointmentById(id)
                        .isEmpty()
        ) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        appointmentService.deleteAppointment(id);


        return ResponseEntity
                .noContent()
                .build();
    }
}