package com.civicconnect.backend.controller;

import com.civicconnect.backend.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    // Endpoint for FEATURE 2: Admin clicks "Explain this to me"
    @GetMapping("/explain/{id}")
    public ResponseEntity<String> explainGrievance(@PathVariable Long id) {
        String jsonExplanation = aiService.explainGrievanceForAdmin(id);
        return ResponseEntity.ok(jsonExplanation);
    }
}