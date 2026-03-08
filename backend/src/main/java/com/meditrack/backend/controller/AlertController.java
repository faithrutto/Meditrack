package com.meditrack.backend.controller;

import com.meditrack.backend.model.Alert;
import com.meditrack.backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PROVIDER') or (hasRole('PATIENT') and @userSecurity.isCurrentUserPatient(#patientId))")
    public ResponseEntity<List<Alert>> getPatientAlerts(@PathVariable Long patientId) {
        return ResponseEntity.ok(alertService.getPatientAlerts(patientId));
    }

    @PutMapping("/{alertId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long alertId) {
        alertService.markAsRead(alertId);
        return ResponseEntity.ok().build();
    }
}
