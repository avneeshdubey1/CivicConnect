package com.civicconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "ngos")
public class Ngo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String category; // e.g., "Education", "Health"
    private String logoUrl;
    private String targetAmount; // e.g., "₹50 Lakhs"
}