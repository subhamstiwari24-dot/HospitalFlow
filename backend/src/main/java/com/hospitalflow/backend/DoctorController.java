package com.hospitalflow.backend;

import com.hospitalflow.backend.entity.Doctor;
import com.hospitalflow.backend.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.identifier() == null || request.password() == null
                || request.identifier().isBlank() || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor ID/email and password are required"));
        }
        return doctorService.authenticate(request.identifier(), request.password())
                .map(doctor -> ResponseEntity.ok(Map.of(
                        "message", "Login successful",
                        "role", "DOCTOR",
                        "doctorId", doctor.getId(),
                        "name", doctor.getName(),
                        "email", doctor.getEmail() == null ? "" : doctor.getEmail()
                )))
                .orElseGet(() -> ResponseEntity.status(401)
                        .body(Map.of("message", "Invalid doctor ID/email or password")));
    }

    public record LoginRequest(String identifier, String password) {}

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return doctorService.getDoctorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.saveDoctor(doctor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable Long id,
            @RequestBody Doctor doctor) {

        return doctorService.updateDoctor(id, doctor)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}