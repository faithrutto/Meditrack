package com.meditrack.backend.repository;

import com.meditrack.backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByPatient_PatientId(Long patientId);
    List<Alert> findByAlertStatus(Alert.AlertStatus status);
}
