package com.civicconnect.backend.controller;

import com.civicconnect.backend.model.Donation;
import com.civicconnect.backend.model.Ngo;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.service.PaymentService;
import com.civicconnect.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/ngos")
    public List<Ngo> getNgos() {
        return paymentService.getAllNgos();
    }

    // ✅ NEW: Start Checkout Session
    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody Map<String, Object> data) {
        try {
            Long ngoId = Long.parseLong(data.get("ngoId").toString());
            Double amount = Double.parseDouble(data.get("amount").toString());
            String sessionUrl = paymentService.createCheckoutSession(ngoId, amount);
            return ResponseEntity.ok(Map.of("url", sessionUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Confirm Donation (Called after redirect back)
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmDonation(@RequestBody Map<String, Object> data, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Long ngoId = Long.parseLong(data.get("ngoId").toString());
        Double amount = Double.parseDouble(data.get("amount").toString());
        String txnId = data.get("txnId").toString(); // This is the Session ID now

        Donation donation = paymentService.saveDonation(user, ngoId, amount, txnId);
        return ResponseEntity.ok(Map.of("id", donation.getId()));
    }

    @GetMapping("/receipt/{id}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id) {
        try {
            byte[] pdfBytes = paymentService.generateReceiptPdf(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=receipt_" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}