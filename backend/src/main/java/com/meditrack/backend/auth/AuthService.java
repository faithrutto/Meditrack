package com.meditrack.backend.auth;

import com.meditrack.backend.auth.dto.AuthResponse;
import com.meditrack.backend.auth.dto.LoginRequest;
import com.meditrack.backend.auth.dto.RegisterRequest;
import com.meditrack.backend.config.JwtTokenProvider;
import com.meditrack.backend.user.Profile;
import com.meditrack.backend.user.ProfileRepository;
import com.meditrack.backend.user.Role;
import com.meditrack.backend.user.User;
import com.meditrack.backend.user.UserRepository;
import com.meditrack.backend.model.Patient;
import com.meditrack.backend.model.Provider;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import com.meditrack.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PatientRepository patientRepository;
    private final ProviderRepository providerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    // Self-injection to go through Spring proxy so @Transactional is honored on
    // saveUserToDatabase
    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private AuthService self;

    // Public entry point — NOT transactional, so email is sent after DB commit
    public AuthResponse register(RegisterRequest request) {
        // Call via 'self' proxy so @Transactional on saveUserToDatabase is honored
        User user = self.saveUserToDatabase(request);
        // Email is sent AFTER the transaction commits; failure here won't roll back the
        // user
        emailService.sendVerificationEmail(user);
        return AuthResponse.builder()
                .message("User registered successfully. Please verify your email.")
                .build();
    }

    @Transactional
    public User saveUserToDatabase(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        Role userRole;
        try {
            userRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            userRole = Role.PATIENT;
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .isEmailVerified(false)
                .isMfaEnabled(false)
                .build();

        user = userRepository.save(user);

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profileRepository.save(profile);

        if (user.getRole() == Role.PATIENT) {
            Patient patient = new Patient();
            patient.setUser(user);
            patient.setRegistrationNumber("PAT-" + user.getId());
            patientRepository.save(patient);
        } else if (user.getRole() == Role.PROVIDER) {
            Provider provider = new Provider();
            provider.setUser(user);
            providerRepository.save(provider);
        }

        return user;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        if (user.isMfaEnabled()) {
            return AuthResponse.builder()
                    .email(user.getEmail())
                    .mfaRequired(true)
                    .message("MFA required")
                    .build();
        }

        String jwt = tokenProvider.generateToken(authentication);

        Profile profile = profileRepository.findByUser(user).orElse(null);
        String firstName = profile != null ? profile.getFirstName() : "";
        String lastName = profile != null ? profile.getLastName() : "";
        String emergencyContactName = profile != null ? profile.getEmergencyContactName() : "";
        String emergencyContactPhone = profile != null ? profile.getEmergencyContactPhone() : "";

        Long patientId = null;
        Long providerId = null;

        if (user.getRole() == Role.PATIENT) {
            patientId = patientRepository.findByUser_Id(user.getId())
                    .map(Patient::getPatientId)
                    .orElse(null);
        } else if (user.getRole() == Role.PROVIDER) {
            providerId = providerRepository.findByUser_Id(user.getId())
                    .map(Provider::getProviderId)
                    .orElse(null);
        }

        return AuthResponse.builder()
                .token(jwt)
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstName(firstName)
                .lastName(lastName)
                .emergencyContactName(emergencyContactName)
                .emergencyContactPhone(emergencyContactPhone)
                .patientId(patientId)
                .providerId(providerId)
                .mfaRequired(false)
                .message("Login successful")
                .build();
    }
}
