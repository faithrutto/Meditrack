package com.meditrack.backend.service;

import com.meditrack.backend.model.Assessment;
import com.meditrack.backend.model.HealthProfile;
import com.meditrack.backend.model.Patient;
import com.meditrack.backend.model.Provider;
import com.meditrack.backend.dto.PatientProfileDto;
import com.meditrack.backend.user.Profile;
import com.meditrack.backend.user.ProfileRepository;
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
    private final ProfileRepository profileRepository;

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

    public PatientProfileDto updateHealthProfile(Long patientId, PatientProfileDto profileDetails) {
        System.out.println("DEBUG: updateHealthProfile called for patientId: " + patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient profile update failed: Patient record (ID: "
                        + patientId + ") does not exist."));

        HealthProfile profile = healthProfileRepository.findByPatient_PatientId(patientId)
                .orElseGet(() -> HealthProfile.builder().patient(patient).build());

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

        healthProfileRepository.save(profile);

        // Update User Profile (Demographics)
        Profile userProfile = profileRepository.findByUser(patient.getUser())
                .orElseGet(() -> {
                    Profile p = new Profile();
                    p.setUser(patient.getUser());
                    return p;
                });

        if (profileDetails.getGender() != null && !profileDetails.getGender().isEmpty())
            userProfile.setGender(profileDetails.getGender());
        if (profileDetails.getHomeAddress() != null && !profileDetails.getHomeAddress().isEmpty())
            userProfile.setHomeAddress(profileDetails.getHomeAddress());
        if (profileDetails.getEmergencyContactName() != null && !profileDetails.getEmergencyContactName().isEmpty())
            userProfile.setEmergencyContactName(profileDetails.getEmergencyContactName());
        if (profileDetails.getEmergencyContactPhone() != null && !profileDetails.getEmergencyContactPhone().isEmpty())
            userProfile.setEmergencyContactPhone(profileDetails.getEmergencyContactPhone());

        profileRepository.save(userProfile);

        return mapToDto(profile, userProfile);
    }

    public PatientProfileDto getPatientHealthProfile(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found ID: " + patientId));

        HealthProfile healthProfile = healthProfileRepository.findByPatient_PatientId(patientId)
                .orElseGet(() -> HealthProfile.builder().patient(patient).build());

        Profile userProfile = profileRepository.findByUser(patient.getUser())
                .orElse(null);

        return mapToDto(healthProfile, userProfile);
    }

    private PatientProfileDto mapToDto(HealthProfile healthProfile, Profile userProfile) {
        return PatientProfileDto.builder()
                .height(healthProfile != null ? healthProfile.getHeight() : null)
                .weight(healthProfile != null ? healthProfile.getWeight() : null)
                .bloodType(healthProfile != null ? healthProfile.getBloodType() : null)
                .knownAllergies(healthProfile != null ? healthProfile.getKnownAllergies() : null)
                .currentMedications(healthProfile != null ? healthProfile.getCurrentMedications() : null)
                .pastMedicalHistory(healthProfile != null ? healthProfile.getPastMedicalHistory() : null)
                .gender(userProfile != null ? userProfile.getGender() : null)
                .homeAddress(userProfile != null ? userProfile.getHomeAddress() : null)
                .emergencyContactName(userProfile != null ? userProfile.getEmergencyContactName() : null)
                .emergencyContactPhone(userProfile != null ? userProfile.getEmergencyContactPhone() : null)
                .build();
    }
}
