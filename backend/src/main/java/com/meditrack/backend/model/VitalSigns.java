package com.meditrack.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "vital_signs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalSigns {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vital_id")
    private Long vitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Patient patient;

    @Column(name = "temperature")
    private Double temperature;
    @Column(name = "blood_pressure")
    private String bloodPressure; // e.g., "120/80"
    @Column(name = "heart_rate")
    private Double heartRate;
    @Column(name = "oxygen_saturation")
    private Double oxygenSaturation;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_provider_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Provider recordedBy;
}
