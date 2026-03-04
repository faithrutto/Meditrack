package com.meditrack.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long healthProfileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;

    private String bloodType;
    private Double height; // cm
    private Double weight; // kg

    @Column(columnDefinition = "TEXT")
    private String knownAllergies;

    @Column(columnDefinition = "TEXT")
    private String currentMedications;

    @Column(columnDefinition = "TEXT")
    private String pastMedicalHistory;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
}
