package com.civicconnect.backend.service;

import com.civicconnect.backend.model.Grievance;
import com.civicconnect.backend.repository.GrievanceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ✅ FEATURE 1: Auto-Action Plan (Triggered on Submit)
    @Async
    public void analyzeGrievance(Long grievanceId) {
        try {
            Grievance grievance = grievanceRepository.findById(grievanceId).orElseThrow();
            
            // ✅ UPDATED: Using gemini-2.5-flash
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            String promptText = String.format(
                "Analyze this grievance. Reason about the issue like a municipal officer.\n" +
                "Complaint: \"%s\"\nLocation: \"%s\"\n\n" +
                "Output strictly valid JSON with these fields:\n" +
                "{\n" +
                "  \"issue_summary\": \"string\",\n" +
                "  \"probable_department\": \"string\",\n" +
                "  \"risk_level\": \"LOW/MEDIUM/HIGH\",\n" +
                "  \"reason_for_risk\": \"string\",\n" +
                "  \"recommended_actions\": [\"string\", \"string\"],\n" +
                "  \"estimated_resolution_time_hours\": \"string\",\n" +
                "  \"citizen_update_message\": \"string\"\n" +
                "}",
                grievance.getDescription(), grievance.getLocation()
            );

            String jsonResponse = callGemini(url, promptText);
            String cleanJson = extractJson(jsonResponse);

            JsonNode actionPlan = objectMapper.readTree(cleanJson);
            
            String category = actionPlan.path("probable_department").asText("OTHER").toUpperCase();
            if (category.contains("ROAD")) category = "ROADS";
            if (category.contains("ELECT")) category = "ELECTRICITY";
            if (category.contains("SANIT")) category = "SANITATION";
            
            grievance.setCategory(category);
            grievance.setPriority(actionPlan.path("risk_level").asText("LOW").toUpperCase());
            grievance.setAiAnalysisJson(cleanJson); 

            grievanceRepository.save(grievance);
            System.out.println("✅ Feature 1 (Action Plan) Completed for ID: " + grievanceId);

        } catch (HttpClientErrorException e) {
            System.err.println("❌ Feature 1 Failed: " + e.getStatusCode() + " : " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("❌ Feature 1 Failed: " + e.getMessage());
        }
    }

    // ✅ FEATURE 2: Admin Explanation (Called via Browser)
    public String explainGrievanceForAdmin(Long grievanceId) {
        try {
            Grievance grievance = grievanceRepository.findById(grievanceId).orElseThrow();
            
            // ✅ UPDATED: Using gemini-2.5-flash
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            String promptText = String.format(
                "Read this complaint and explain it to a busy admin.\n" +
                "Complaint: \"%s\"\n\n" +
                "Output strictly valid JSON:\n" +
                "{\n" +
                "  \"plain_english_summary\": \"Simple 1-sentence explanation\",\n" +
                "  \"key_problem\": \"The core operational issue\",\n" +
                "  \"what_admin_should_do_next\": \"Immediate next step\",\n" +
                "  \"possible_consequences_if_ignored\": \"Risk assessment\"\n" +
                "}",
                grievance.getDescription()
            );

            String jsonResponse = callGemini(url, promptText);
            return extractJson(jsonResponse);

        } catch (HttpClientErrorException e) {
            // Returns the REAL Google error to your browser
            return "{\"error\": \"Google API Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString().replace("\"", "'") + "\"}";
        } catch (Exception e) {
            return "{\"error\": \"Internal Error: " + e.getMessage() + "\"}";
        }
    }

    private String callGemini(String url, String prompt) {
        Map<String, Object> contentPart = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(contentPart));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String response = restTemplate.postForObject(url, entity, String.class);
        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini API response");
        }
    }

    private String extractJson(String rawText) {
        int start = rawText.indexOf("{");
        int end = rawText.lastIndexOf("}");
        if (start == -1 || end == -1) return "{}";
        return rawText.substring(start, end + 1);
    }
}