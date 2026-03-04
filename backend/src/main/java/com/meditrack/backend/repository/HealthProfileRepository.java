package com.meditrack.backend.repository;

import com.meditrack.backend.model.HealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {
    Optional<HealthProfile> findByPatient_PatientId(Long patientId);
}
