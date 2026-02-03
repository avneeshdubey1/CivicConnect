package com.civicconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    // RENAMED FIELD: Matches Frontend and DTOs now
    @Column(nullable = false)
    private String password; 

    @Column(nullable = false)
    private String mobileNumber;

    @Column(nullable = false)
    private String role = "Citizen"; 

    private LocalDateTime createdAt = LocalDateTime.now();
}