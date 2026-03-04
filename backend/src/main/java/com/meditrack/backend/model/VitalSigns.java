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
    private Long vitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private Double temperature;
    private String bloodPressure; // e.g., "120/80"
    private Double heartRate;
    private Double oxygenSaturation;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_provider_id")
    private Provider recordedBy;
}
