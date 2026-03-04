package com.meditrack.backend.repository;

import com.meditrack.backend.model.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VitalSignsRepository extends JpaRepository<VitalSigns, Long> {
    List<VitalSigns> findByPatient_PatientId(Long patientId);
    List<VitalSigns> findByPatient_PatientIdOrderByTimestampDesc(Long patientId);
    List<VitalSigns> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
