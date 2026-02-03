package com.civicconnect.backend.service;

import com.civicconnect.backend.dto.CivicPulseDto;
import com.civicconnect.backend.model.Grievance; // <--- CHANGED from Complaint to Grievance
import com.civicconnect.backend.repository.GrievanceRepository; // <--- CHANGED Repository
import com.civicconnect.backend.repository.EventRepository;
import com.civicconnect.backend.repository.EventRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CivicPulseService {

    private final GrievanceRepository grievanceRepository; // <--- Updated Variable
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    public CivicPulseDto calculateCivicPulse() {
        CivicPulseDto pulse = new CivicPulseDto();
        
        CivicPulseDto.ComplaintMetrics complaintMetrics = calculateComplaintMetrics();
        pulse.setComplaintMetrics(complaintMetrics);
        
        CivicPulseDto.ResolutionMetrics resolutionMetrics = calculateResolutionMetrics();
        pulse.setResolutionMetrics(resolutionMetrics);
        
        CivicPulseDto.VolunteerMetrics volunteerMetrics = calculateVolunteerMetrics();
        pulse.setVolunteerMetrics(volunteerMetrics);
        
        int score = calculateOverallScore(complaintMetrics, resolutionMetrics, volunteerMetrics);
        pulse.setScore(score);
        
        if (score >= 70) {
            pulse.setStatus("HEALTHY");
            pulse.setMessage("City operations are running smoothly. Keep up the good work!");
        } else if (score >= 40) {
            pulse.setStatus("WARNING");
            pulse.setMessage("Some areas need attention. Monitor grievance resolution and volunteer engagement.");
        } else {
            pulse.setStatus("CRITICAL");
            pulse.setMessage("Immediate action required! High grievance volume and low resolution rate detected.");
        }
        
        return pulse;
    }

    private CivicPulseDto.ComplaintMetrics calculateComplaintMetrics() {
        CivicPulseDto.ComplaintMetrics metrics = new CivicPulseDto.ComplaintMetrics();
        
        // Fetch from GrievanceRepository
        List<Grievance> allGrievances = grievanceRepository.findAll();
        long totalComplaints = allGrievances.size();
        
        // FIXED: Check for Uppercase "PENDING"
        long openComplaints = allGrievances.stream()
                .filter(c -> "PENDING".equalsIgnoreCase(c.getStatus()))
                .count();
                
        // FIXED: Check for Uppercase "RESOLVED"
        long resolvedComplaints = allGrievances.stream()
                .filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus()))
                .count();
        
        double resolutionRate = totalComplaints > 0 
                ? (resolvedComplaints * 100.0 / totalComplaints) 
                : 0;
        
        // Trend Calculation
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime fourteenDaysAgo = LocalDateTime.now().minusDays(14);
        
        long recentComplaints = allGrievances.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(sevenDaysAgo))
                .count();
        long previousComplaints = allGrievances.stream()
                .filter(c -> c.getCreatedAt() != null && 
                        c.getCreatedAt().isAfter(fourteenDaysAgo) && 
                        c.getCreatedAt().isBefore(sevenDaysAgo))
                .count();
        
        String trend = "STABLE";
        if (recentComplaints > previousComplaints * 1.2) {
            trend = "INCREASING";
        } else if (recentComplaints < previousComplaints * 0.8) {
            trend = "DECREASING";
        }
        
        metrics.setTotalComplaints(totalComplaints);
        metrics.setOpenComplaints(openComplaints);
        metrics.setResolvedComplaints(resolvedComplaints);
        metrics.setResolutionRate(Math.round(resolutionRate * 100.0) / 100.0);
        metrics.setTrend(trend);
        
        return metrics;
    }

    private CivicPulseDto.ResolutionMetrics calculateResolutionMetrics() {
        CivicPulseDto.ResolutionMetrics metrics = new CivicPulseDto.ResolutionMetrics();
        
        List<Grievance> resolvedGrievances = grievanceRepository.findAll().stream()
                .filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus())) // Uppercase Fix
                .toList();
        
        double avgDays = 0;
        if (!resolvedGrievances.isEmpty()) {
            long totalDays = resolvedGrievances.stream()
                    .filter(c -> c.getCreatedAt() != null)
                    .mapToLong(c -> ChronoUnit.DAYS.between(c.getCreatedAt(), LocalDateTime.now()))
                    .sum();
            avgDays = (double) totalDays / resolvedGrievances.size();
        } else {
             // Logic Fix: If no grievances are resolved, don't default to "0 days" (perfect). 
             // Default to a high number so performance isn't falsely "EXCELLENT".
             avgDays = 10; 
        }
        
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentlyResolved = resolvedGrievances.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(sevenDaysAgo))
                .count();
        
        String performance = "NEEDS_IMPROVEMENT";
        if (!resolvedGrievances.isEmpty() && avgDays < 3) {
            performance = "EXCELLENT";
        } else if (!resolvedGrievances.isEmpty() && avgDays < 7) {
            performance = "GOOD";
        }
        
        metrics.setAverageResolutionDays(Math.round(avgDays * 100.0) / 100.0);
        metrics.setComplaintsResolvedLast7Days(recentlyResolved);
        metrics.setPerformance(performance);
        
        return metrics;
    }

    private CivicPulseDto.VolunteerMetrics calculateVolunteerMetrics() {
        CivicPulseDto.VolunteerMetrics metrics = new CivicPulseDto.VolunteerMetrics();
        
        long totalEvents = eventRepository.count();
        long upcomingEvents = eventRepository.findByStatus("UPCOMING").size();
        long totalVolunteers = eventRegistrationRepository.countByStatus("REGISTERED");
        
        String engagement = "LOW";
        if (totalEvents > 0) {
            double volunteersPerEvent = (double) totalVolunteers / totalEvents;
            if (volunteersPerEvent >= 20) {
                engagement = "HIGH";
            } else if (volunteersPerEvent >= 10) {
                engagement = "MEDIUM";
            }
        }
        
        metrics.setTotalEvents(totalEvents);
        metrics.setUpcomingEvents(upcomingEvents);
        metrics.setTotalVolunteers(totalVolunteers);
        metrics.setEngagement(engagement);
        
        return metrics;
    }

    private int calculateOverallScore(
            CivicPulseDto.ComplaintMetrics complaintMetrics,
            CivicPulseDto.ResolutionMetrics resolutionMetrics,
            CivicPulseDto.VolunteerMetrics volunteerMetrics) {
        
        int complaintScore = (int) (complaintMetrics.getResolutionRate() * 0.7);
        if ("DECREASING".equals(complaintMetrics.getTrend())) {
            complaintScore += 10;
        } else if ("INCREASING".equals(complaintMetrics.getTrend())) {
            complaintScore -= 10;
        }
        
        int resolutionScore = 0;
        if ("EXCELLENT".equals(resolutionMetrics.getPerformance())) {
            resolutionScore = 40;
        } else if ("GOOD".equals(resolutionMetrics.getPerformance())) {
            resolutionScore = 25;
        } else {
            resolutionScore = 10;
        }
        
        int volunteerScore = 0;
        if ("HIGH".equals(volunteerMetrics.getEngagement())) {
            volunteerScore = 30;
        } else if ("MEDIUM".equals(volunteerMetrics.getEngagement())) {
            volunteerScore = 20;
        } else {
            volunteerScore = 10;
        }
        
        int totalScore = complaintScore + resolutionScore + volunteerScore;
        return Math.min(100, Math.max(0, totalScore));
    }
}