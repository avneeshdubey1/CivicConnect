package com.civicconnect.backend.dto;

import lombok.Data;

@Data
public class CivicPulseDto {
    private String status; // HEALTHY, WARNING, CRITICAL
    private int score; // 0-100
    private String message;
    
    // Breakdown metrics
    private ComplaintMetrics complaintMetrics;
    private ResolutionMetrics resolutionMetrics;
    private VolunteerMetrics volunteerMetrics;
    
    @Data
    public static class ComplaintMetrics {
        private long totalComplaints;
        private long openComplaints;
        private long resolvedComplaints;
        private double resolutionRate; // percentage
        private String trend; // INCREASING, STABLE, DECREASING
    }
    
    @Data
    public static class ResolutionMetrics {
        private double averageResolutionDays;
        private long complaintsResolvedLast7Days;
        private String performance; // EXCELLENT, GOOD, NEEDS_IMPROVEMENT
    }
    
    @Data
    public static class VolunteerMetrics {
        private long totalEvents;
        private long upcomingEvents;
        private long totalVolunteers;
        private String engagement; // HIGH, MEDIUM, LOW
    }
}
