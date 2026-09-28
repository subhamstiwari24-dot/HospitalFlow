package com.hospitalflow.backend;

import com.hospitalflow.backend.dto.SlotAvailabilityResponse;
import com.hospitalflow.backend.service.SlotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5175"
})
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    // =====================================================
    // GET DOCTOR AVAILABLE SLOTS
    // =====================================================
    //
    // GET /api/doctors/{doctorId}/slots?date=2026-09-27
    //
    // =====================================================

    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<SlotAvailabilityResponse> getDoctorSlots(
            @PathVariable Long doctorId,
            @RequestParam String date
    ) {

        SlotAvailabilityResponse response =
                slotService.getAvailableSlots(
                        doctorId,
                        date
                );

        return ResponseEntity.ok(response);
    }
}