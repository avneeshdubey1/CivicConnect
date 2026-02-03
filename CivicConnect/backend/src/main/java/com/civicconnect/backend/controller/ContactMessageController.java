package com.civicconnect.backend.controller;

import com.civicconnect.backend.model.ContactMessage;
import com.civicconnect.backend.repository.ContactMessageRepository;
import com.civicconnect.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactMessageController {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private EmailService emailService;

    // Public Endpoint: Submit Contact Form
    @PostMapping
    public ContactMessage submitMessage(@RequestBody ContactMessage message) {
        return contactMessageRepository.save(message);
    }

    // Admin Endpoint: Get All Messages
    @GetMapping
    public List<ContactMessage> getAllMessages() {
        // In a real app, you'd check for Admin role here or via Security Config
        // For now relying on Frontend routing protection + backend security config if
        // present
        return contactMessageRepository.findAll();
    }

    // Admin Endpoint: Reply to Message
    @PutMapping("/{id}/reply")
    public ContactMessage replyToMessage(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        String reply = payload.get("reply");
        message.setAdminReply(reply);
        message.setStatus("RESOLVED");

        ContactMessage updated = contactMessageRepository.save(message);

        // Send Email
        try {
            emailService.sendSimpleEmail(
                    updated.getEmail(),
                    "Re: " + updated.getSubject() + " - CivicConnect Support",
                    "Hello " + updated.getName() + ",\n\n" +
                            "Thank you for reaching out to us. regarding your inquiry:\n\n" +
                            "\"" + updated.getMessage() + "\"\n\n" +
                            "Our Response:\n" +
                            reply + "\n\n" +
                            "Best Regards,\nCivicConnect Team");
        } catch (Exception e) {
            System.err.println("Failed to send reply email: " + e.getMessage());
        }

        return updated;
    }
}
