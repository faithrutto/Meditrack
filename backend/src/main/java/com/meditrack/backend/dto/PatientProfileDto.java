package com.meditrack.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfileDto {
    // HealthProfile fields
    private Double height;
    private Double weight;
    private String bloodType;
    private String knownAllergies;
    private String currentMedications;
    private String pastMedicalHistory;
    
    // User Profile fields (Demographics)
    private String gender;
    private String homeAddress;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
