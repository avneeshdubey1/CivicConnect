package com.civicconnect.backend.repository;

import com.civicconnect.backend.model.PublicUtility;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicUtilityRepository extends JpaRepository<PublicUtility, Long> {
    // We can add spatial queries later if needed, but basic fetch is fine for now
}