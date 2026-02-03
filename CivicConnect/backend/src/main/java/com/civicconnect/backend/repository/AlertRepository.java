package com.civicconnect.backend.repository;

import com.civicconnect.backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    // Check specific ordering if needed, e.g., newest first
    List<Alert> findAllByOrderByCreatedAtDesc();
}
