package com.civicconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "donations")
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User donor;

    @ManyToOne
    @JoinColumn(name = "ngo_id")
    private Ngo ngo;

    private Double amount;
    @Column(unique = true)
    private String stripePaymentId; // Transaction ID from Stripe
    private String status; // "SUCCESS", "FAILED"
    private LocalDateTime donationDate;

    @PrePersist
    protected void onCreate() {
        donationDate = LocalDateTime.now();
    }
}