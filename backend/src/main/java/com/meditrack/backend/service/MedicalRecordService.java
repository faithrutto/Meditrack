package com.meditrack.backend.service;

import com.meditrack.backend.model.Assessment;
import com.meditrack.backend.model.HealthProfile;
import com.meditrack.backend.model.Patient;
import com.meditrack.backend.model.Provider;
import com.meditrack.backend.repository.AssessmentRepository;
import com.meditrack.backend.repository.HealthProfileRepository;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final AssessmentRepository assessmentRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final PatientRepository patientRepository;
    private final ProviderRepository providerRepository;

    public Assessment recordAssessment(Long patientId, Long providerId, String diagnosis, String notes) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        Assessment assessment = Assessment.builder()
                .patient(patient)
                .provider(provider)
                .diagnosis(diagnosis)
                .clinicalNotes(notes)
                .assessmentDate(LocalDateTime.now())
                .build();

        return assessmentRepository.save(assessment);
    }

    public List<Assessment> getPatientAssessments(Long patientId) {
        return assessmentRepository.findByPatient_PatientIdOrderByAssessmentDateDesc(patientId);
    }

    public HealthProfile updateHealthProfile(Long patientId, HealthProfile profileDetails) {
        HealthProfile profile = healthProfileRepository.findByPatient_PatientId(patientId)
                .orElse(HealthProfile.builder().patient(patientRepository.findById(patientId).orElseThrow()).build());
        
        profile.setBloodType(profileDetails.getBloodType());
        profile.setHeight(profileDetails.getHeight());
        profile.setWeight(profileDetails.getWeight());
        profile.setKnownAllergies(profileDetails.getKnownAllergies());
        profile.setCurrentMedications(profileDetails.getCurrentMedications());
        profile.setPastMedicalHistory(profileDetails.getPastMedicalHistory());

        return healthProfileRepository.save(profile);
    }

    public HealthProfile getPatientHealthProfile(Long patientId) {
        return healthProfileRepository.findByPatient_PatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}
