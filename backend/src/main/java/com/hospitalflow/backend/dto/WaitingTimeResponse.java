package com.hospitalflow.backend.dto;

public class WaitingTimeResponse {

    private String tokenNumber;
    private int patientsAhead;
    private int estimatedMinMinutes;
    private int estimatedMaxMinutes;
    private String message;

    public WaitingTimeResponse() {
    }

    public WaitingTimeResponse(
            String tokenNumber,
            int patientsAhead,
            int estimatedMinMinutes,
            int estimatedMaxMinutes,
            String message) {

        this.tokenNumber = tokenNumber;
        this.patientsAhead = patientsAhead;
        this.estimatedMinMinutes = estimatedMinMinutes;
        this.estimatedMaxMinutes = estimatedMaxMinutes;
        this.message = message;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public int getPatientsAhead() {
        return patientsAhead;
    }

    public int getEstimatedMinMinutes() {
        return estimatedMinMinutes;
    }

    public int getEstimatedMaxMinutes() {
        return estimatedMaxMinutes;
    }

    public String getMessage() {
        return message;
    }
}