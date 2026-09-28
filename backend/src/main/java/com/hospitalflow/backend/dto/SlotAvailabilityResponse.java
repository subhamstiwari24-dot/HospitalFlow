package com.hospitalflow.backend.dto;

import java.util.List;

public class SlotAvailabilityResponse {

    private Long doctorId;
    private String date;
    private List<SlotResponse> slots;

    public SlotAvailabilityResponse() {
    }

    public SlotAvailabilityResponse(
            Long doctorId,
            String date,
            List<SlotResponse> slots
    ) {
        this.doctorId = doctorId;
        this.date = date;
        this.slots = slots;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<SlotResponse> getSlots() {
        return slots;
    }

    public void setSlots(List<SlotResponse> slots) {
        this.slots = slots;
    }
}