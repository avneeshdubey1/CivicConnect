package com.civicconnect.backend.repository;

import com.civicconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    // ✅ NEW: Add this line to fix the AuthController error
    Optional<User> findByEmail(String email);
    
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}