package com.meditrack.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alertId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private String alertType; // e.g., "HIGH_BLOOD_PRESSURE", "LOW_OXYGEN"

    @Enumerated(EnumType.STRING)
    private AlertStatus alertStatus;

    private String message;

    private LocalDateTime createdAt;

    public enum AlertStatus {
        UNREAD,
        ACKNOWLEDGED,
        RESOLVED
    }
}
