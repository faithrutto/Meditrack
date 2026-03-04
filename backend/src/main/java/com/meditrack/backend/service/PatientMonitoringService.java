package com.meditrack.backend.service;

import com.meditrack.backend.model.Patient;
import com.meditrack.backend.model.Provider;
import com.meditrack.backend.model.VitalSigns;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import com.meditrack.backend.repository.VitalSignsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PatientMonitoringService {

    private final VitalSignsRepository vitalSignsRepository;
    private final PatientRepository patientRepository;
    private final ProviderRepository providerRepository;
    private final AlertService alertService;

    public VitalSigns recordVitals(Long patientId, Long providerId, Double temp, String bp, Double hr, Double o2) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Provider provider = null;
        if (providerId != null) {
            provider = providerRepository.findById(providerId).orElse(null);
        }

        VitalSigns vitals = VitalSigns.builder()
                .patient(patient)
                .recordedBy(provider)
                .temperature(temp)
                .bloodPressure(bp)
                .heartRate(hr)
                .oxygenSaturation(o2)
                .timestamp(LocalDateTime.now())
                .build();

        vitals = vitalSignsRepository.save(vitals);

        analyzeVitals(patient, vitals);

        return vitals;
    }

    private void analyzeVitals(Patient patient, VitalSigns vitals) {
        if (vitals.getHeartRate() != null && (vitals.getHeartRate() > 100 || vitals.getHeartRate() < 60)) {
            alertService.createAlert(patient, "ABNORMAL_HEART_RATE", "Heart rate is abnormal: " + vitals.getHeartRate());
        }

        if (vitals.getOxygenSaturation() != null && vitals.getOxygenSaturation() < 95) {
            alertService.createAlert(patient, "LOW_OXYGEN", "Oxygen saturation is dangerously low: " + vitals.getOxygenSaturation() + "%");
        }
        
        if (vitals.getTemperature() != null && (vitals.getTemperature() > 37.5 || vitals.getTemperature() < 35.0)) {
            alertService.createAlert(patient, "ABNORMAL_TEMPERATURE", "Temperature is out of range: " + vitals.getTemperature());
        }
    }
}
