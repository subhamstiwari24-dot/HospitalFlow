package com.hospitalflow.backend;

import com.hospitalflow.backend.dto.QueuePositionResponse;
import com.hospitalflow.backend.dto.WaitingTimeResponse;
import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(
            @PathVariable Long id) {

        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/queue")
    public List<Appointment> getWaitingQueue(
            @RequestParam Long doctorId,
            @RequestParam String appointmentDate) {

        return appointmentService.getWaitingQueue(
                doctorId,
                appointmentDate
        );
    }

    @GetMapping("/{id}/queue-position")
    public ResponseEntity<QueuePositionResponse> getQueuePosition(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.getQueuePosition(id)
        );
    }

    @GetMapping("/{id}/waiting-time")
    public ResponseEntity<WaitingTimeResponse> getWaitingTime(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.getWaitingTime(id)
        );
    }

    @PostMapping
    public Appointment createAppointment(
            @RequestBody Appointment appointment) {

        return appointmentService.saveAppointment(appointment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment appointment) {

        return appointmentService.getAppointmentById(id)
                .map(existingAppointment -> {

                    existingAppointment.setPatientName(
                            appointment.getPatientName()
                    );

                    existingAppointment.setPatientPhone(
                            appointment.getPatientPhone()
                    );

                    existingAppointment.setAppointmentDate(
                            appointment.getAppointmentDate()
                    );

                    existingAppointment.setAppointmentTime(
                            appointment.getAppointmentTime()
                    );

                    existingAppointment.setTokenNumber(
                            appointment.getTokenNumber()
                    );

                    existingAppointment.setStatus(
                            appointment.getStatus()
                    );

                    existingAppointment.setDoctor(
                            appointment.getDoctor()
                    );

                    existingAppointment.setHospital(
                            appointment.getHospital()
                    );

                    return ResponseEntity.ok(
                            appointmentService.saveAppointment(
                                    existingAppointment
                            )
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                appointmentService.updateStatus(id, status)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Long id) {

        appointmentService.deleteAppointment(id);

        return ResponseEntity.noContent().build();
    }
}