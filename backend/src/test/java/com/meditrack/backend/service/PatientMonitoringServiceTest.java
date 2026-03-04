package com.meditrack.backend.service;

import com.meditrack.backend.model.Patient;
import com.meditrack.backend.model.VitalSigns;
import com.meditrack.backend.repository.PatientRepository;
import com.meditrack.backend.repository.ProviderRepository;
import com.meditrack.backend.repository.VitalSignsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class PatientMonitoringServiceTest {

    @Mock
    private VitalSignsRepository vitalSignsRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ProviderRepository providerRepository;

    @Mock
    private AlertService alertService;

    @InjectMocks
    private PatientMonitoringService patientMonitoringService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRecordVitalsNormalReadings() {
        Patient patient = new Patient();
        patient.setPatientId(1L);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(vitalSignsRepository.save(any(VitalSigns.class))).thenAnswer(i -> i.getArguments()[0]);

        VitalSigns vitals = patientMonitoringService.recordVitals(1L, null, 36.8, "120/80", 72.0, 98.0);

        assertNotNull(vitals);
        assertEquals(36.8, vitals.getTemperature());

        // Ensure no alerts were triggered for normal vitals
        verify(alertService, never()).createAlert(any(), anyString(), anyString());
    }

    @Test
    void testRecordVitalsTriggersAlert() {
        Patient patient = new Patient();
        patient.setPatientId(1L);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(vitalSignsRepository.save(any(VitalSigns.class))).thenAnswer(i -> i.getArguments()[0]);

        // Temp is normal, but HR is super high (120) and O2 is very low (90)
        patientMonitoringService.recordVitals(1L, null, 37.0, "130/90", 120.0, 90.0);

        // Should trigger heart rate alert
        verify(alertService, times(1)).createAlert(eq(patient), eq("ABNORMAL_HEART_RATE"), anyString());

        // Should trigger oxygen alert
        verify(alertService, times(1)).createAlert(eq(patient), eq("LOW_OXYGEN"), anyString());

        // Should NOT trigger temperature alert
        verify(alertService, never()).createAlert(eq(patient), eq("ABNORMAL_TEMPERATURE"), anyString());
    }
}
