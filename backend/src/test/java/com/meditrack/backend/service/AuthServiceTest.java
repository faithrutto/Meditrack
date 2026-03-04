package com.meditrack.backend.service;

import com.meditrack.backend.auth.AuthService;
import com.meditrack.backend.auth.dto.AuthResponse;
import com.meditrack.backend.auth.dto.RegisterRequest;
import com.meditrack.backend.user.ProfileRepository;
import com.meditrack.backend.user.User;
import com.meditrack.backend.user.UserRepository;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import com.meditrack.backend.config.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ProviderRepository providerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private com.meditrack.backend.service.EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Set the self-injection field to the service itself for testing
        org.springframework.test.util.ReflectionTestUtils.setField(authService, "self", authService);
    }

    @Test
    void testRegisterNewUserSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("password123");
        request.setFirstName("Test");
        request.setLastName("User");
        request.setRole("PATIENT");

        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail("test@test.com");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("User registered successfully. Please verify your email.", response.getMessage());

        verify(userRepository, times(1)).save(any(User.class));
        verify(profileRepository, times(1)).save(any());
    }

    @Test
    void testRegisterExistingEmailThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@test.com");

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });

        assertEquals("Email is already registered", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
