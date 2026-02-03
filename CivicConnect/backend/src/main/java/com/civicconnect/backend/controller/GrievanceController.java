package com.civicconnect.backend.controller;

import com.civicconnect.backend.model.Grievance;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.repository.GrievanceRepository;
import com.civicconnect.backend.repository.UserRepository;
import com.civicconnect.backend.service.EmailService;
import com.civicconnect.backend.service.PdfService;
import com.civicconnect.backend.service.AiService; // <--- Import AI Service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grievances")
@CrossOrigin(origins = "*")
public class GrievanceController {

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PdfService pdfService;
    
    @Autowired
    private AiService aiService; // <--- Inject AI Service

    @PostMapping
    public Grievance createGrievance(@RequestBody Grievance grievance, @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        User user = userRepository.findByUsername(username).orElseThrow();

        grievance.setUser(user);
        if (grievance.getStatus() == null) {
            grievance.setStatus("PENDING");
        }
        
        Grievance saved = grievanceRepository.save(grievance);

        // 1. Trigger AI Analysis (Async - won't slow down response)
        aiService.analyzeGrievance(saved.getId()); 

        // 2. Send Email
        try {
            emailService.sendSimpleEmail(
                user.getEmail(),
                "Grievance Received: " + saved.getTitle(),
                "Hello " + user.getUsername() + ",\n\n" +
                "We have received your grievance regarding '" + saved.getCategory() + "'.\n" +
                "Tracking ID: " + saved.getId() + "\n\n" +
                "We will notify you once an update is available."
            );
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return saved;
    }

    // ... (Keep getGrievances, updateStatus, and downloadGrievancePdf EXACTLY as they were) ...
    // Just make sure you keep the other methods I gave you in the previous steps!
    
    @GetMapping
    public List<Grievance> getGrievances(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        User user = userRepository.findByUsername(username).orElseThrow();

        if ("Admin".equals(user.getRole())) {
            return grievanceRepository.findAll();
        } else {
            return grievanceRepository.findByUserId(user.getId());
        }
    }

    @PutMapping("/{id}/status")
    public Grievance updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found"));
        
        String oldStatus = grievance.getStatus();
        String newStatus = payload.get("status");
        
        if (payload.containsKey("status")) {
            grievance.setStatus(newStatus);
        }

        if (payload.containsKey("resolutionRemark")) {
            grievance.setResolutionRemark(payload.get("resolutionRemark"));
        }
        
        Grievance updated = grievanceRepository.save(grievance);

        if (newStatus != null && !newStatus.equals(oldStatus)) {
            try {
                String subject = "Update on Grievance #" + updated.getId();
                String body = "Hello,\n\n" +
                              "Your grievance '" + updated.getTitle() + "' has been updated to: " + newStatus + ".\n\n" +
                              (updated.getResolutionRemark() != null ? "Admin Remark: " + updated.getResolutionRemark() : "") + 
                              "\n\nLogin to the dashboard to see full details.";
                
                emailService.sendSimpleEmail(updated.getUser().getEmail(), subject, body);
            } catch (Exception e) {
                System.err.println("Failed to send status update email: " + e.getMessage());
            }
        }
        
        return updated;
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadGrievancePdf(@PathVariable Long id) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found"));
        
        byte[] pdfBytes = pdfService.generateGrievancePdf(grievance);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=grievance-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}