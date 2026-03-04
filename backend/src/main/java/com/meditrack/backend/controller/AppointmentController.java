package com.meditrack.backend.controller;

import com.meditrack.backend.model.Appointment;
import com.meditrack.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(
            @RequestParam Long patientId,
            @RequestParam Long providerId,
            @RequestParam String date,
            @RequestParam String purpose) {
        
        LocalDateTime appointmentDate = LocalDateTime.parse(date);
        Appointment appointment = appointmentService.bookAppointment(patientId, providerId, appointmentDate, purpose);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<Appointment>> getProviderAppointments(@PathVariable Long providerId) {
        return ResponseEntity.ok(appointmentService.getProviderAppointments(providerId));
    }

    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long appointmentId,
            @RequestParam Appointment.AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(appointmentId, status));
    }
}
