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
import com.meditrack.backend.model.VerificationCode;
import com.meditrack.backend.model.VerificationCode.VerificationCodeType;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import com.meditrack.backend.repository.VerificationCodeRepository;
import com.meditrack.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

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
    private final VerificationCodeRepository verificationCodeRepository;

    // Public entry point - transactional to ensure all DB operations succeed
    // together
    @Transactional
    public AuthResponse register(RegisterRequest request) {
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

        // Generate and send OTP for registration
        generateAndSendOtp(user, VerificationCodeType.REGISTRATION);

        return AuthResponse.builder()
                .message("Registration successful. Please enter the verification code sent to your email.")
                .build();
    }

    public void generateAndSendOtp(User user, VerificationCodeType type) {
        // Remove old codes of same type
        verificationCodeRepository.deleteByUserAndType(user, type);

        // Generate 6-digit code
        String code = String.format("%06d", new Random().nextInt(1000000));

        VerificationCode verificationCode = VerificationCode.builder()
                .code(code)
                .user(user)
                .type(type)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .build();

        verificationCodeRepository.save(verificationCode);
        emailService.sendOtpEmail(user.getEmail(), code, type.name());

        // For local development ease: log to a dedicated file
        try {
            java.nio.file.Files.writeString(java.nio.file.Paths.get("LATEST_OTP.txt"),
                    "Type: " + type + "\nEmail: " + user.getEmail() + "\nCode: " + code + "\nTime: "
                            + java.time.LocalDateTime.now());
        } catch (java.io.IOException e) {
            System.err.println("Could not write OTP to file: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String code, VerificationCodeType type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VerificationCode verificationCode = verificationCodeRepository.findByUserAndCodeAndType(user, code, type)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification code"));

        if (verificationCode.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new RuntimeException("Verification code has expired");
        }

        if (type == VerificationCodeType.REGISTRATION) {
            user.setEmailVerified(true);
            userRepository.save(user);
            verificationCodeRepository.delete(verificationCode);
        }

        // We DO NOT delete the code if it's PASSWORD_RESET because ResetPassword
        // needs to verify it again when actually submitting the new password.

        return AuthResponse.builder()
                .message("Verification successful")
                .build();
    }

    @Transactional
    public AuthResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        generateAndSendOtp(user, VerificationCodeType.PASSWORD_RESET);

        return AuthResponse.builder()
                .message("Password reset code sent to your email")
                .build();
    }

    @Transactional
    public AuthResponse resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VerificationCode verificationCode = verificationCodeRepository
                .findByUserAndCodeAndType(user, code, VerificationCodeType.PASSWORD_RESET)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset code"));

        if (verificationCode.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new RuntimeException("Reset code has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        verificationCodeRepository.delete(verificationCode);

        return AuthResponse.builder()
                .message("Password has been reset successfully")
                .build();
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
                .userId(user.getId())
                .mfaRequired(false)
                .message("Login successful")
                .build();
    }
}
