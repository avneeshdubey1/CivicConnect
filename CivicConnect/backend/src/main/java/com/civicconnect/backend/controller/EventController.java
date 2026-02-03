package com.civicconnect.backend.controller;

import com.civicconnect.backend.dto.EventCreateDto;
import com.civicconnect.backend.dto.EventResponseDto;
import com.civicconnect.backend.dto.EventUpdateDto;
import com.civicconnect.backend.model.EventCategory;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.repository.UserRepository;
import com.civicconnect.backend.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    // Get current authenticated user
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // POST: Create Event (Admin only)
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody EventCreateDto dto) {
        User user = getCurrentUser();
        
        if (!"Admin".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only Admin users can create events"));
        }

        try {
            var event = eventService.createEvent(dto, user);
            return ResponseEntity.ok(Map.of(
                "message", "Event created successfully!",
                "eventId", event.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET: List all upcoming events
    @GetMapping
    public ResponseEntity<List<EventResponseDto>> getUpcomingEvents() {
        User user = getCurrentUser();
        List<EventResponseDto> events = eventService.getUpcomingEvents(user);
        return ResponseEntity.ok(events);
    }

    // GET: Get event by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            EventResponseDto event = eventService.getEventById(id, user);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // PUT: Update event (Creator only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody EventUpdateDto dto) {
        try {
            User user = getCurrentUser();
            var event = eventService.updateEvent(id, dto, user);
            return ResponseEntity.ok(Map.of(
                "message", "Event updated successfully!",
                "eventId", event.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE: Cancel event (Creator only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            eventService.deleteEvent(id, user);
            return ResponseEntity.ok(Map.of("message", "Event cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // POST: Register as volunteer
    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerVolunteer(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            eventService.registerVolunteer(id, user);
            return ResponseEntity.ok(Map.of("message", "Successfully registered as volunteer!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE: Unregister from event
    @DeleteMapping("/{id}/register")
    public ResponseEntity<?> unregisterVolunteer(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            eventService.unregisterVolunteer(id, user);
            return ResponseEntity.ok(Map.of("message", "Successfully unregistered from event"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET: My created events (Admin only)
    @GetMapping("/my-events")
    public ResponseEntity<?> getMyEvents() {
        User user = getCurrentUser();
        
        if (!"Admin".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only Admin users can view created events"));
        }

        List<EventResponseDto> events = eventService.getEventsByCreator(user);
        return ResponseEntity.ok(events);
    }

    // GET: My registrations (participation history)
    @GetMapping("/my-registrations")
    public ResponseEntity<List<EventResponseDto>> getMyRegistrations() {
        User user = getCurrentUser();
        List<EventResponseDto> events = eventService.getUserParticipationHistory(user);
        return ResponseEntity.ok(events);
    }

    // GET: Available event categories
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        List<Map<String, String>> categories = Arrays.stream(EventCategory.values())
                .map(cat -> Map.of("value", cat.name(), "label", cat.getDisplayName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    // GET: Filter events by category
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getEventsByCategory(@PathVariable String category) {
        try {
            User user = getCurrentUser();
            EventCategory eventCategory = EventCategory.valueOf(category.toUpperCase());
            List<EventResponseDto> events = eventService.getEventsByCategory(eventCategory, user);
            return ResponseEntity.ok(events);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid category"));
        }
    }

    // --- 👇 NEW ENDPOINT: Get Volunteer List (Admin Only) ---
    @GetMapping("/{id}/volunteers")
    public ResponseEntity<?> getEventVolunteers(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            
            if (!"Admin".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Admins can view the volunteer list"));
            }

            List<Map<String, String>> volunteers = eventService.getEventVolunteers(id);
            return ResponseEntity.ok(volunteers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}