package com.meditrack.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private boolean mfaRequired;
    private String message;
    private String firstName;
    private String lastName;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private Long patientId;
    private Long providerId;
}
