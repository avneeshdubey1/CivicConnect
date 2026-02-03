package com.civicconnect.backend.dto;

import com.civicconnect.backend.model.EventCategory;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventCreateDto {
    private String title;
    private String description;
    private String venue;
    private LocalDateTime eventDate;
    private EventCategory category;
    private Integer maxVolunteers; // null means unlimited
    private String imageUrl;
}
