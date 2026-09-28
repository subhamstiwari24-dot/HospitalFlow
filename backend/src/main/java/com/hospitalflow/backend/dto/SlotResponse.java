package com.hospitalflow.backend.dto;

public class SlotResponse {

    private String id;
    private String time;
    private boolean available;
    private int remaining;

    public SlotResponse() {
    }

    public SlotResponse(
            String id,
            String time,
            boolean available,
            int remaining
    ) {
        this.id = id;
        this.time = time;
        this.available = available;
        this.remaining = remaining;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getRemaining() {
        return remaining;
    }

    public void setRemaining(int remaining) {
        this.remaining = remaining;
    }
}