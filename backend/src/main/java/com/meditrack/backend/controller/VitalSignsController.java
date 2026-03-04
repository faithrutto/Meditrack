package com.meditrack.backend.controller;

import com.meditrack.backend.model.VitalSigns;
import com.meditrack.backend.service.PatientMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vitals")
@RequiredArgsConstructor
public class VitalSignsController {

    private final PatientMonitoringService patientMonitoringService;

    @PostMapping("/record")
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
}
