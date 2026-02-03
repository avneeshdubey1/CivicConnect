package com.civicconnect.backend.repository;

import com.civicconnect.backend.model.Event;
import com.civicconnect.backend.model.EventRegistration;
import com.civicconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    
    Optional<EventRegistration> findByEventAndUser(Event event, User user);
    
    List<EventRegistration> findByUserOrderByRegisteredAtDesc(User user);
    
    List<EventRegistration> findByEvent(Event event);
    
    long countByEventAndStatus(Event event, String status);
    
    long countByStatus(String status);
    
    boolean existsByEventAndUserAndStatus(Event event, User user, String status);
    
    void deleteByEventAndUser(Event event, User user);

    // --- 👇 NEW METHOD ---
    List<EventRegistration> findByEventAndStatus(Event event, String status);
}
