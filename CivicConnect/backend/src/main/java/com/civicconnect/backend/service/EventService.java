package com.civicconnect.backend.service;

import com.civicconnect.backend.dto.EventCreateDto;
import com.civicconnect.backend.dto.EventResponseDto;
import com.civicconnect.backend.dto.EventUpdateDto;
import com.civicconnect.backend.model.Event;
import com.civicconnect.backend.model.EventCategory;
import com.civicconnect.backend.model.EventRegistration;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.repository.EventRegistrationRepository;
import com.civicconnect.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map; // Added for Map
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EmailService emailService; 

    // Create Event (Admin only)
    public Event createEvent(EventCreateDto dto, User creator) {
        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setVenue(dto.getVenue());
        event.setEventDate(dto.getEventDate());
        event.setCategory(dto.getCategory());
        event.setMaxVolunteers(dto.getMaxVolunteers());
        event.setImageUrl(dto.getImageUrl());
        event.setCreatedBy(creator);
        event.setStatus("UPCOMING");
        event.setCreatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }

    // Update Event (Creator only)
    public Event updateEvent(Long id, EventUpdateDto dto, User user) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (!event.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Only the event creator can update this event");
        }

        if (dto.getTitle() != null) event.setTitle(dto.getTitle());
        if (dto.getDescription() != null) event.setDescription(dto.getDescription());
        if (dto.getVenue() != null) event.setVenue(dto.getVenue());
        if (dto.getEventDate() != null) event.setEventDate(dto.getEventDate());
        if (dto.getCategory() != null) event.setCategory(dto.getCategory());
        if (dto.getMaxVolunteers() != null) event.setMaxVolunteers(dto.getMaxVolunteers());
        if (dto.getImageUrl() != null) event.setImageUrl(dto.getImageUrl());
        if (dto.getStatus() != null) event.setStatus(dto.getStatus());

        return eventRepository.save(event);
    }

    // Delete/Cancel Event
    @Transactional
    public void deleteEvent(Long id, User user) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (!event.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Only the event creator can delete this event");
        }

        event.setStatus("CANCELLED");
        eventRepository.save(event);
    }

    // Get All Upcoming Events
    public List<EventResponseDto> getUpcomingEvents(User currentUser) {
        LocalDateTime now = LocalDateTime.now();
        List<Event> events = eventRepository.findByStatusAndEventDateAfterOrderByEventDateAsc("UPCOMING", now);
        return events.stream()
                .map(event -> mapToResponseDto(event, currentUser))
                .collect(Collectors.toList());
    }

    // Get Event by ID
    public EventResponseDto getEventById(Long id, User currentUser) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToResponseDto(event, currentUser);
    }

    // Get Events Created by User
    public List<EventResponseDto> getEventsByCreator(User user) {
        List<Event> events = eventRepository.findByCreatedByOrderByCreatedAtDesc(user);
        return events.stream()
                .map(event -> mapToResponseDto(event, user))
                .collect(Collectors.toList());
    }

    // Register Volunteer + SEND EMAIL
    @Transactional
    public void registerVolunteer(Long eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Check if already registered
        if (eventRegistrationRepository.existsByEventAndUserAndStatus(event, user, "REGISTERED")) {
            throw new RuntimeException("You are already registered for this event");
        }

        // Check capacity
        long currentRegistrations = eventRegistrationRepository.countByEventAndStatus(event, "REGISTERED");
        if (event.getMaxVolunteers() != null && currentRegistrations >= event.getMaxVolunteers()) {
            throw new RuntimeException("Event is full. No more volunteers can register.");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(user);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus("REGISTERED");

        eventRegistrationRepository.save(registration);

        // Send Confirmation Email
        try {
            String formattedDate = event.getEventDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
            String subject = "Registration Confirmed: " + event.getTitle();
            String body = "Hello " + user.getUsername() + ",\n\n" +
                          "You have successfully registered as a volunteer for '" + event.getTitle() + "'.\n\n" +
                          "📅 Date: " + formattedDate + "\n" +
                          "📍 Venue: " + event.getVenue() + "\n\n" +
                          "Thank you for your contribution to the community!\n\n" +
                          "Best regards,\nCivicConnect Team";

            emailService.sendSimpleEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send event registration email: " + e.getMessage());
        }
    }

    // Unregister Volunteer
    @Transactional
    public void unregisterVolunteer(Long eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventRegistration registration = eventRegistrationRepository.findByEventAndUser(event, user)
                .orElseThrow(() -> new RuntimeException("You are not registered for this event"));

        registration.setStatus("CANCELLED");
        eventRegistrationRepository.save(registration);
    }

    // Get User's Participation History
    public List<EventResponseDto> getUserParticipationHistory(User user) {
        List<EventRegistration> registrations = eventRegistrationRepository.findByUserOrderByRegisteredAtDesc(user);
        return registrations.stream()
                .map(reg -> {
                    EventResponseDto dto = mapToResponseDto(reg.getEvent(), user);
                    dto.setUserRegistered(reg.getStatus().equals("REGISTERED"));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Get Events by Category
    public List<EventResponseDto> getEventsByCategory(EventCategory category, User currentUser) {
        List<Event> events = eventRepository.findByCategory(category);
        return events.stream()
                .map(event -> mapToResponseDto(event, currentUser))
                .collect(Collectors.toList());
    }

    // --- 👇 NEW METHOD: Get Volunteers for Admin ---
    public List<Map<String, String>> getEventVolunteers(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<EventRegistration> registrations = eventRegistrationRepository.findByEventAndStatus(event, "REGISTERED");

        return registrations.stream().map(reg -> {
            User user = reg.getUser();
            return Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "mobileNumber", user.getMobileNumber() != null ? user.getMobileNumber() : "N/A",
                "registeredAt", reg.getRegisteredAt().toString()
            );
        }).collect(Collectors.toList());
    }

    // Helper: Map Event to ResponseDto
    private EventResponseDto mapToResponseDto(Event event, User currentUser) {
        EventResponseDto dto = new EventResponseDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setVenue(event.getVenue());
        dto.setEventDate(event.getEventDate());
        dto.setCategory(event.getCategory());
        dto.setMaxVolunteers(event.getMaxVolunteers());
        dto.setStatus(event.getStatus());
        dto.setImageUrl(event.getImageUrl());
        dto.setCreatorName(event.getCreatedBy().getUsername());
        dto.setCreatorId(event.getCreatedBy().getId());
        dto.setCreatedAt(event.getCreatedAt());

        // Calculate registration count
        long regCount = eventRegistrationRepository.countByEventAndStatus(event, "REGISTERED");
        dto.setRegistrationCount((int) regCount);

        // Check if current user is registered
        boolean isRegistered = currentUser != null && 
                eventRegistrationRepository.existsByEventAndUserAndStatus(event, currentUser, "REGISTERED");
        dto.setUserRegistered(isRegistered);

        // Calculate available slots
        if (event.getMaxVolunteers() != null) {
            dto.setAvailableSlots(event.getMaxVolunteers() - (int) regCount);
        } else {
            dto.setAvailableSlots(null); // Unlimited
        }

        return dto;
    }
}