package com.meditrack.backend.config;

import com.meditrack.backend.model.Patient;
import com.meditrack.backend.model.Provider;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import com.meditrack.backend.repository.VitalSignsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {

    private final PatientRepository patientRepository;
    private final ProviderRepository providerRepository;

    private final VitalSignsRepository vitalSignsRepository;

    public boolean isCurrentUserPatient(Long patientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("AUTH FAILED: No authentication found");
            return false;
        }
        String email = authentication.getName();
        boolean result = patientRepository.findById(patientId)
                .map(patient -> {
                    String patientUserEmail = patient.getUser().getEmail();
                    boolean match = patientUserEmail.equals(email);
                    System.out.println("AUTH CHECK for patientId " + patientId + ": email=" + email
                            + ", patientUserEmail=" + patientUserEmail + ", match=" + match);
                    return match;
                })
                .orElseGet(() -> {
                    System.out.println("AUTH FAILED: Patient with ID " + patientId + " not found in database");
                    return false;
                });
        return result;
    }

    public boolean isCurrentUserProvider(Long providerId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        String email = authentication.getName();
        return providerRepository.findById(providerId)
                .map(provider -> provider.getUser().getEmail().equals(email))
                .orElse(false);
    }

    public boolean canEditVitals(Long vitalId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String email = authentication.getName();
        return vitalSignsRepository.findById(vitalId).map(vitals -> {
            // Providers can edit any vitals
            if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PROVIDER"))) {
                return true;
            }
            // Patients can only edit their own vitals
            return vitals.getPatient().getUser().getEmail().equals(email);
        }).orElse(false);
    }
}
