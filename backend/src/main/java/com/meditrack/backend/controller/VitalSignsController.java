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
    @PreAuthorize("hasRole('PROVIDER') or (hasRole('PATIENT') and @userSecurity.isCurrentUserPatient(#patientId))")
    public ResponseEntity<VitalSigns> recordVitals(
            @RequestParam Long patientId,
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) Double temp,
            @RequestParam(required = false) String bp,
            @RequestParam(required = false) Double hr,
            @RequestParam(required = false) Double o2) {

        VitalSigns vitals = patientMonitoringService.recordVitals(patientId, providerId, temp, bp, hr, o2);
        return ResponseEntity.ok(vitals);
    }

    @PutMapping("/{vitalId}")
    @PreAuthorize("@userSecurity.canEditVitals(#vitalId)")
    public ResponseEntity<VitalSigns> updateVitals(
            @PathVariable("vitalId") Long vitalId,
            @RequestParam(required = false) Double temp,
            @RequestParam(required = false) String bp,
            @RequestParam(required = false) Double hr,
            @RequestParam(required = false) Double o2) {

        VitalSigns vitals = patientMonitoringService.updateVitals(vitalId, temp, bp, hr, o2);
        return ResponseEntity.ok(vitals);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PROVIDER') or (hasRole('PATIENT') and @userSecurity.isCurrentUserPatient(#patientId))")
    public ResponseEntity<java.util.List<VitalSigns>> getPatientVitals(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(patientMonitoringService.getPatientVitals(patientId));
    }
}
