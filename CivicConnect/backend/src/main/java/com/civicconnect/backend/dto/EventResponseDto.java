package com.civicconnect.backend.dto;

import com.civicconnect.backend.model.EventCategory;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventResponseDto {
    private Long id;
    private String title;
    private String description;
    private String venue;
    private LocalDateTime eventDate;
    private EventCategory category;
    private Integer maxVolunteers;
    private String status;
    private String imageUrl;
    private String creatorName;
    private Long creatorId;
    private LocalDateTime createdAt;
    private int registrationCount;
    private boolean userRegistered; // Changed from isUserRegistered
    private Integer availableSlots; // null if unlimited
}
