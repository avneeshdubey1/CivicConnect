package com.civicconnect.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // 1. The Generic Method (Matches what GrievanceController calls)
    public void sendSimpleEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("your-email@gmail.com"); // Optional: Sets the 'From' header
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("Email successfully sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("Error sending email to " + toEmail + ": " + e.getMessage());
            // We catch the error so it doesn't crash the whole Grievance API if email fails
        }
    }

    // 2. Your specific method (You can keep this if you use it elsewhere, or remove it)
    public void sendResolutionEmail(String toEmail, String complaintTitle, String remark) {
        sendSimpleEmail(
            toEmail, 
            "Complaint Resolved: " + complaintTitle, 
            "Dear User,\n\nYour complaint '" + complaintTitle + "' has been resolved.\n\nAdmin Remark: " + remark + "\n\nThank you,\nCivicConnect Team"
        );
    }
}