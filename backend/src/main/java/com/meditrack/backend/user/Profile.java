package com.meditrack.backend.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
public class Profile {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    private String firstName;
    private String lastName;

    private String bloodType;
    
    @Column(columnDefinition = "TEXT")
    private String allergies;
    
    @Column(columnDefinition = "TEXT")
    private String chronicIllnesses;

    private String emergencyContactName;
    private String emergencyContactPhone;

    // Dark mode setting
    private boolean isDarkMode = false;
}
