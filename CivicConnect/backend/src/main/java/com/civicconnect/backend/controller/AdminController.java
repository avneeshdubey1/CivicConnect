package com.civicconnect.backend.controller;

import com.civicconnect.backend.dto.CivicPulseDto;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.repository.UserRepository;
import com.civicconnect.backend.service.CivicPulseService;
import com.civicconnect.backend.model.Donation; // Import Donation
import com.civicconnect.backend.repository.DonationRepository; // Import Repository
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final CivicPulseService civicPulseService;
    private final UserRepository userRepository;
    private final DonationRepository donationRepository; //  Added Donation Repo

    // GET: api/admin/civic-pulse
    @GetMapping("/civic-pulse")
    public ResponseEntity<CivicPulseDto> getCivicPulse() {
        CivicPulseDto pulse = civicPulseService.calculateCivicPulse();
        return ResponseEntity.ok(pulse);
    }

    // GET: api/admin/users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // GET: api/admin/donations (NEW ENDPOINT)
    @GetMapping("/donations")
    public ResponseEntity<List<Donation>> getAllDonations() {
        // Return all donations, sorted by ID descending (newest first)
        List<Donation> donations = donationRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(donations);
    }
}