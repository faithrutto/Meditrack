package com.meditrack.backend.service;

import com.meditrack.backend.model.Alert;
import com.meditrack.backend.model.Patient;
import com.meditrack.backend.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public Alert createAlert(Patient patient, String alertType, String message) {
        Alert alert = Alert.builder()
                .patient(patient)
                .alertType(alertType)
                .message(message)
                .alertStatus(Alert.AlertStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();
        return alertRepository.save(alert);
    }

    public List<Alert> getPatientAlerts(Long patientId) {
        return alertRepository.findByPatient_PatientId(patientId);
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByAlertStatus(Alert.AlertStatus.UNREAD);
    }

    public void markAsRead(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setAlertStatus(Alert.AlertStatus.ACKNOWLEDGED);
        alertRepository.save(alert);
    }
}
