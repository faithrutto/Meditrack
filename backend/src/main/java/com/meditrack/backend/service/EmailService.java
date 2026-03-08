package com.meditrack.backend.service;

import com.meditrack.backend.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${meditrack.email.enabled:true}")
    private boolean emailEnabled;

    @Async
    public void sendVerificationEmail(User user) {
        if (!emailEnabled) {
            log.info("Email sending is disabled. Skipping verification email for {}", user.getEmail());
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@meditrack.com");
            message.setTo(user.getEmail());
            message.setSubject("Verify Your MediTrack Account");

            // In a real application, you'd generate a secure token here.
            String verificationLink = "http://localhost:3000/verify-email?email=" + user.getEmail();

            message.setText("Welcome to MediTrack!\n\n" +
                    "Please verify your email address by clicking the link below:\n" +
                    verificationLink + "\n\n" +
                    "Thank you!");

            mailSender.send(message);
            log.info("Verification email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async
    public void sendOtpEmail(String email, String otp, String type) {
        if (!emailEnabled) {
            log.info("Email sending is disabled. Skipping OTP email for {}", email);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@meditrack.com");
            message.setTo(email);
            message.setSubject("MediTrack - Your Verification Code");

            message.setText("Your verification code for " + type + " is: " + otp + "\n\n" +
                    "This code will expire in 10 minutes. Please do not share this code with anyone.");

            mailSender.send(message);
            log.info("OTP email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", email, e.getMessage());
        }
    }
}
