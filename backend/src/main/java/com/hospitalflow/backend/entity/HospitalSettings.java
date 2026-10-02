package com.hospitalflow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_settings")
public class HospitalSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "hospital_id", nullable = false, unique = true)
    private Hospital hospital;

    @Column(nullable = false)
    private String opdStartTime = "09:00 AM";

    @Column(nullable = false)
    private String opdEndTime = "05:00 PM";

    @Column(nullable = false)
    private Boolean bookingEnabled = true;

    @Column(nullable = false)
    private Boolean sameDayBookingEnabled = true;

    @Column(nullable = false)
    private Boolean cancellationEnabled = true;

    @Column(nullable = false)
    private Integer defaultSlotCapacity = 10;

    @Column(nullable = false)
    private Integer consultationDurationMinutes = 30;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Hospital getHospital() { return hospital; }
    public void setHospital(Hospital hospital) { this.hospital = hospital; }
    public String getOpdStartTime() { return opdStartTime; }
    public void setOpdStartTime(String value) { this.opdStartTime = value; }
    public String getOpdEndTime() { return opdEndTime; }
    public void setOpdEndTime(String value) { this.opdEndTime = value; }
    public Boolean getBookingEnabled() { return bookingEnabled; }
    public void setBookingEnabled(Boolean value) { this.bookingEnabled = value; }
    public Boolean getSameDayBookingEnabled() { return sameDayBookingEnabled; }
    public void setSameDayBookingEnabled(Boolean value) { this.sameDayBookingEnabled = value; }
    public Boolean getCancellationEnabled() { return cancellationEnabled; }
    public void setCancellationEnabled(Boolean value) { this.cancellationEnabled = value; }
    public Integer getDefaultSlotCapacity() { return defaultSlotCapacity; }
    public void setDefaultSlotCapacity(Integer value) { this.defaultSlotCapacity = value; }
    public Integer getConsultationDurationMinutes() { return consultationDurationMinutes; }
    public void setConsultationDurationMinutes(Integer value) { this.consultationDurationMinutes = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime value) { this.updatedAt = value; }
}