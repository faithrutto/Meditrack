package com.meditrack.backend.config;

import com.meditrack.backend.model.Patient;
import com.meditrack.backend.model.Provider;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {

    private final PatientRepository patientRepository;
    private final ProviderRepository providerRepository;

    public boolean isCurrentUserPatient(Long patientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        String email = authentication.getName();
        return patientRepository.findById(patientId)
                .map(patient -> patient.getUser().getEmail().equals(email))
                .orElse(false);
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
}
