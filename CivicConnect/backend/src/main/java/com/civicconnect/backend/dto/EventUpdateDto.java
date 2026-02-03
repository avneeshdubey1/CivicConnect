package com.civicconnect.backend.dto;

import com.civicconnect.backend.model.EventCategory;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventUpdateDto {
    private String title;
    private String description;
    private String venue;
    private LocalDateTime eventDate;
    private EventCategory category;
    private Integer maxVolunteers;
    private String imageUrl;
    private String status; // UPCOMING, ONGOING, COMPLETED, CANCELLED
}
