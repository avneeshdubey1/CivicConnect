package com.civicconnect.backend.controller;

import com.civicconnect.backend.model.PublicUtility;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.repository.PublicUtilityRepository;
import com.civicconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilities")
@CrossOrigin(origins = "*")
public class PublicUtilityController {

    @Autowired
    private PublicUtilityRepository utilityRepository;

    @Autowired
    private UserRepository userRepository;

    // GET ALL (Public)
    @GetMapping
    public List<PublicUtility> getAllUtilities() {
        // FIX 1: Auto-Seed if empty so you never lose your map points
        if (utilityRepository.count() == 0) {
            seedDataInternal();
        }
        return utilityRepository.findAll();
    }

    // POST (Protected: Checks ROLE instead of Name)
    @PostMapping
    public PublicUtility addUtility(@RequestBody PublicUtility utility, @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();

        // FIX 2: Check the ACTUAL ROLE from the database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"Admin".equals(user.getRole())) {
            throw new RuntimeException("Access Denied: You are not an Admin. Role is: " + user.getRole());
        }
        
        return utilityRepository.save(utility);
    }

    // Internal Helper for Seeding
    private void seedDataInternal() {
        createAndSave("City General Hospital", "HOSPITAL", 19.0330, 73.0297, "Sector 15, Belapur", "102");
        createAndSave("Sunshine School", "SCHOOL", 19.0350, 73.0280, "Sector 11, CBD", "022-275466");
        createAndSave("Central Police Station", "POLICE", 19.0310, 73.0250, "Sector 3, Belapur", "100");
        createAndSave("Apollo Pharmacy", "HOSPITAL", 19.0345, 73.0310, "Sector 8, Kharghar", "+91-9898989898");
        System.out.println("--- Map Data Auto-Seeded ---");
    }

    private void createAndSave(String name, String type, double lat, double lng, String address, String contact) {
        PublicUtility u = new PublicUtility();
        u.setName(name); u.setType(type); u.setLat(lat); u.setLng(lng); u.setAddress(address); u.setContactNumber(contact);
        utilityRepository.save(u);
    }
}