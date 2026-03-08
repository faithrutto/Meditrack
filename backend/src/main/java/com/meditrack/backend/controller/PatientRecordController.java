package com.meditrack.backend.controller;

import com.meditrack.backend.model.Assessment;
import com.meditrack.backend.model.HealthProfile;
import com.meditrack.backend.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class PatientRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping("/assessment")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Assessment> recordAssessment(
            @RequestParam Long patientId,
            @RequestParam Long providerId,
            @RequestParam String diagnosis,
            @RequestParam String notes) {

        Assessment assessment = medicalRecordService.recordAssessment(patientId, providerId, diagnosis, notes);
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/assessment/patient/{patientId}")
    @PreAuthorize("hasRole('PROVIDER') or (hasRole('PATIENT') and @userSecurity.isCurrentUserPatient(#patientId))")
    public ResponseEntity<List<Assessment>> getPatientAssessments(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(medicalRecordService.getPatientAssessments(patientId));
    }

    @PutMapping("/profile/{patientId}")
    @PreAuthorize("hasRole('PROVIDER') or (hasRole('PATIENT') and @userSecurity.isCurrentUserPatient(#patientId))")
    public ResponseEntity<HealthProfile> updateHealthProfile(
            @PathVariable("patientId") Long patientId,
            @RequestBody HealthProfile profile) {
        return ResponseEntity.ok(medicalRecordService.updateHealthProfile(patientId, profile));
    }

    @GetMapping("/profile/{patientId}")
    @PreAuthorize("hasRole('PROVIDER') or (hasRole('PATIENT') and @userSecurity.isCurrentUserPatient(#patientId))")
    public ResponseEntity<HealthProfile> getPatientHealthProfile(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(medicalRecordService.getPatientHealthProfile(patientId));
    }
}
