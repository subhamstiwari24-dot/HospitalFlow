package com.hospitalflow.backend.dto;

public class QueuePositionResponse {

    private String tokenNumber;
    private int position;
    private int patientsAhead;
    private String status;

    public QueuePositionResponse() {
    }

    public QueuePositionResponse(
            String tokenNumber,
            int position,
            int patientsAhead,
            String status) {

        this.tokenNumber = tokenNumber;
        this.position = position;
        this.patientsAhead = patientsAhead;
        this.status = status;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public int getPosition() {
        return position;
    }

    public int getPatientsAhead() {
        return patientsAhead;
    }

    public String getStatus() {
        return status;
    }
}