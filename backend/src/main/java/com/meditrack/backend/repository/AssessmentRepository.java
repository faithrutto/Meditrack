package com.meditrack.backend.repository;

import com.meditrack.backend.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByPatient_PatientId(Long patientId);
    List<Assessment> findByProvider_ProviderId(Long providerId);
    List<Assessment> findByPatient_PatientIdOrderByAssessmentDateDesc(Long patientId);
}
