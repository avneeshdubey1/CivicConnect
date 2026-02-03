package com.civicconnect.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "grievances")
public class Grievance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String category; 
    private String priority; 
    private String location;
    private String status = "PENDING"; 

    @Lob
    @Column(name = "grievance_image", columnDefinition = "LONGTEXT")
    private String grievanceImage;

    // ✅ NEW: Store the full AI Action Plan JSON here
    @Column(name = "ai_analysis_json", columnDefinition = "TEXT") // Use VARCHAR(4000) or LONGTEXT if TEXT isn't supported by your DB dialect
    private String aiAnalysisJson;

    private String resolutionRemark;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // --- GETTERS AND SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolutionRemark() { return resolutionRemark; }
    public void setResolutionRemark(String resolutionRemark) { this.resolutionRemark = resolutionRemark; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getGrievanceImage() { return grievanceImage; }
    public void setGrievanceImage(String grievanceImage) { this.grievanceImage = grievanceImage; }

    public String getAiAnalysisJson() { return aiAnalysisJson; }
    public void setAiAnalysisJson(String aiAnalysisJson) { this.aiAnalysisJson = aiAnalysisJson; }
}