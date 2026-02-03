package com.civicconnect.backend.service;

import com.civicconnect.backend.model.Alert;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.repository.AlertRepository;
import com.civicconnect.backend.repository.UserRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${twilio.account-sid}")
    private String twilioSid;

    @Value("${twilio.auth-token}")
    private String twilioToken;

    @Value("${twilio.phone-number}")
    private String twilioPhoneNumber;

    @Value("${spring.mail.username}")
    private String myEmail;

    @PostConstruct
    public void initTwilio() {
        try {
            if (twilioSid != null && !twilioSid.startsWith("ACXXX")) {
                Twilio.init(twilioSid, twilioToken);
                System.out.println("✅ Twilio Initialized");
            } else {
                System.out.println("⚠️ Twilio credentials not configured. SMS will be skipped.");
            }
        } catch (Exception e) {
            System.err.println("❌ Twilio Init Failed: " + e.getMessage());
        }
    }

    public Alert createAlert(Alert alert) {
        Alert savedAlert = alertRepository.save(alert);

        // Broadcast asynchronously to not block the response
        broadcastAlert(savedAlert);

        return savedAlert;
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }

    @Async
    public void broadcastAlert(Alert alert) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            // 1. Send Email
            try {
                sendEmail(user.getEmail(), alert);
            } catch (Exception e) {
                System.err.println("Failed to email " + user.getEmail());
            }

            // 2. Send SMS (Only if Twilio configured)
            if (twilioSid != null && !twilioSid.startsWith("ACXXX")) {
                try {
                    sendSms(user.getMobileNumber(), alert);
                } catch (Exception e) {
                    System.err.println("Failed to SMS " + user.getMobileNumber() + ": " + e.getMessage());
                }
            }
        }
    }

    private void sendEmail(String toParams, Alert alert) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(myEmail);
        message.setTo(toParams);
        message.setSubject("CivicConnect Alert: " + alert.getTitle());
        String alertTime = alert.getCreatedAt().toString().replace("T", " ");
        message.setText("URGENT ALERT\n\n" +
                "Severity: " + alert.getSeverity() + "\n" +
                "City: " + (alert.getCity() != null ? alert.getCity() : "All Regions") + "\n" +
                "Time: " + alertTime + "\n\n" +
                alert.getMessage() + "\n\n" +
                "- CivicConnect Admin Team");
        mailSender.send(message);
    }

    private void sendSms(String toParams, Alert alert) {
        // Basic formatting to ensure E.164 format if possible,
        // assumes users stored numbers with country code or we default to India (+91)
        // if missing
        String formattedNumber = toParams.trim();
        if (!formattedNumber.startsWith("+")) {
            formattedNumber = "+91" + formattedNumber; // Defaulting to India for this use case
        }

        String alertTime = alert.getCreatedAt().toString().replace("T", " ");
        String body = "ALERT [" + alert.getSeverity() + "]\n" +
                "City: " + (alert.getCity() != null ? alert.getCity() : "General") + "\n" +
                alert.getTitle() + "\n" +
                alert.getMessage() + "\n" +
                "Time: " + alertTime;

        Message.creator(
                new PhoneNumber(formattedNumber),
                new PhoneNumber(twilioPhoneNumber),
                body).create();
    }
}
