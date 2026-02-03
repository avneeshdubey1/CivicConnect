package com.civicconnect.backend.repository;

import com.civicconnect.backend.model.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    // This magic method fetches all grievances for a specific user
    List<Grievance> findByUserId(Long userId);
}
