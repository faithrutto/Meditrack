package com.meditrack.backend.repository;

import com.meditrack.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUser_Id(Long userId);
    Optional<Patient> findByRegistrationNumber(String registrationNumber);
}
