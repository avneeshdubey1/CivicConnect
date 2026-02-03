package com.civicconnect.backend.repository;

import com.civicconnect.backend.model.Event;
import com.civicconnect.backend.model.EventCategory;
import com.civicconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByStatus(String status);
    
    List<Event> findByCreatedBy(User user);
    
    List<Event> findByEventDateAfter(LocalDateTime date);
    
    List<Event> findByCategory(EventCategory category);
    
    List<Event> findByStatusAndEventDateAfterOrderByEventDateAsc(String status, LocalDateTime date);
    
    List<Event> findByCreatedByOrderByCreatedAtDesc(User user);
}
