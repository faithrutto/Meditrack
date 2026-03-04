package com.meditrack.backend.service;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.model.Patient;
import com.meditrack.backend.model.Provider;
import com.meditrack.backend.repository.AppointmentRepository;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final ProviderRepository providerRepository;

    public Appointment bookAppointment(Long patientId, Long providerId, LocalDateTime date, String purpose) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Check double booking within a 30 min window
        LocalDateTime start = date.minusMinutes(29);
        LocalDateTime end = date.plusMinutes(29);
        List<Appointment> conflicts = appointmentRepository
                .findByProvider_ProviderIdAndAppointmentDateBetween(providerId, start, end);

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Provider is already booked for this time slot.");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .provider(provider)
                .appointmentDate(date)
                .appointmentPurpose(purpose)
                .status(Appointment.AppointmentStatus.PENDING)
                .build();

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatient_PatientId(patientId);
    }

    public List<Appointment> getProviderAppointments(Long providerId) {
        return appointmentRepository.findByProvider_ProviderId(providerId);
    }

    public Appointment updateStatus(Long appointmentId, Appointment.AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }
}
