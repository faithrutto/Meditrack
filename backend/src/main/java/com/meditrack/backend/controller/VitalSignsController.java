package com.meditrack.backend.controller;

import com.meditrack.backend.model.VitalSigns;
import com.meditrack.backend.service.PatientMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vitals")
@RequiredArgsConstructor
public class VitalSignsController {

    private final PatientMonitoringService patientMonitoringService;

    @PostMapping("/record")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<VitalSigns> recordVitals(
            @RequestParam Long patientId,
            @RequestParam(required = false) Long providerId,
            @RequestParam Double temp,
            @RequestParam String bp,
            @RequestParam Double hr,
            @RequestParam Double o2) {

        VitalSigns vitals = patientMonitoringService.recordVitals(patientId, providerId, temp, bp, hr, o2);
        return ResponseEntity.ok(vitals);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PROVIDER') or (hasRole('PATIENT') and @userSecurity.isCurrentUserPatient(#patientId))")
    public ResponseEntity<java.util.List<VitalSigns>> getPatientVitals(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientMonitoringService.getPatientVitals(patientId));
    }
}
