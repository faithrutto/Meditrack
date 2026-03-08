package com.meditrack.backend.repository;

import com.meditrack.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient_PatientIdOrderByAppointmentDateDesc(Long patientId);

    List<Appointment> findByProvider_ProviderIdOrderByAppointmentDateDesc(Long providerId);

    List<Appointment> findByProvider_ProviderIdAndAppointmentDateBetween(Long providerId, LocalDateTime start,
            LocalDateTime end);
}
