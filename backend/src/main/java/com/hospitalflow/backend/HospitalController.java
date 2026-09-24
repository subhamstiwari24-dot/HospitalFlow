package com.hospitalflow.backend;

import com.hospitalflow.backend.entity.Hospital;
import com.hospitalflow.backend.service.HospitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "http://localhost:5173")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public List<Hospital> getAllHospitals() {
        return hospitalService.getAllHospitals();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospitalById(@PathVariable Long id) {
        return hospitalService.getHospitalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Hospital createHospital(@RequestBody Hospital hospital) {
        return hospitalService.saveHospital(hospital);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hospital> updateHospital(
            @PathVariable Long id,
            @RequestBody Hospital hospital) {

        return hospitalService.getHospitalById(id)
                .map(existingHospital -> {
                    existingHospital.setName(hospital.getName());
                    existingHospital.setAddress(hospital.getAddress());
                    existingHospital.setCity(hospital.getCity());
                    existingHospital.setPhone(hospital.getPhone());
                    existingHospital.setActive(hospital.isActive());

                    return ResponseEntity.ok(
                            hospitalService.saveHospital(existingHospital)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.noContent().build();
    }
}