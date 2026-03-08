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
        System.out.println("DEBUG: updateHealthProfile called for patientId: " + patientId);

        HealthProfile profile = healthProfileRepository.findByPatient_PatientId(patientId)
                .orElseGet(() -> {
                    System.out.println("DEBUG: Creating new health profile for patient " + patientId);
                    Patient patient = patientRepository.findById(patientId)
                            .orElseThrow(() -> {
                                System.out.println("DEBUG ERROR: Patient ID " + patientId + " NOT FOUND in database");
                                return new RuntimeException("Patient profile update failed: Patient record (ID: "
                                        + patientId + ") does not exist.");
                            });
                    return HealthProfile.builder().patient(patient).build();
                });

        if (profileDetails.getBloodType() != null && !profileDetails.getBloodType().isEmpty())
            profile.setBloodType(profileDetails.getBloodType());

        if (profileDetails.getHeight() != null)
            profile.setHeight(profileDetails.getHeight());

        if (profileDetails.getWeight() != null)
            profile.setWeight(profileDetails.getWeight());

        if (profileDetails.getKnownAllergies() != null && !profileDetails.getKnownAllergies().isEmpty())
            profile.setKnownAllergies(profileDetails.getKnownAllergies());

        if (profileDetails.getCurrentMedications() != null && !profileDetails.getCurrentMedications().isEmpty())
            profile.setCurrentMedications(profileDetails.getCurrentMedications());

        if (profileDetails.getPastMedicalHistory() != null && !profileDetails.getPastMedicalHistory().isEmpty())
            profile.setPastMedicalHistory(profileDetails.getPastMedicalHistory());

        return healthProfileRepository.save(profile);
    }

    public HealthProfile getPatientHealthProfile(Long patientId) {
        return healthProfileRepository.findByPatient_PatientId(patientId)
                .orElseGet(() -> {
                    Patient patient = patientRepository.findById(patientId)
                            .orElseThrow(() -> new RuntimeException("Patient not found ID: " + patientId));
                    return HealthProfile.builder().patient(patient).build();
                });
    }
}
