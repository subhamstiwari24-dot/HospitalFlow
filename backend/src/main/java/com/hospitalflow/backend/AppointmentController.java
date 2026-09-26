package com.hospitalflow.backend;

import com.hospitalflow.backend.entity.Appointment;
import com.hospitalflow.backend.repository.AppointmentRepository;
import com.hospitalflow.backend.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;

    public AppointmentController(
            AppointmentService appointmentService,
            AppointmentRepository appointmentRepository
    ) {
        this.appointmentService = appointmentService;
        this.appointmentRepository = appointmentRepository;
    }

    // Get all appointments
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // Get appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(
            @PathVariable Long id
    ) {
        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get appointments of a particular patient
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

    // Get waiting queue for a doctor
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

    // Create appointment
    @PostMapping
    public Appointment createAppointment(
            @RequestBody Appointment appointment
    ) {
        return appointmentService.saveAppointment(appointment);
    }

    // Update appointment
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
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Long id
    ) {

        if (appointmentService.getAppointmentById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        appointmentService.deleteAppointment(id);

        return ResponseEntity.noContent().build();
    }
}