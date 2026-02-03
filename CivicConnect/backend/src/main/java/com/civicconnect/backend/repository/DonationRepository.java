package com.civicconnect.backend.repository;

import com.civicconnect.backend.model.Donation;
import com.civicconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    // Custom query to find donations by a specific user (for their history)
    List<Donation> findByDonor(User donor);

    // Find by Stripe Session ID (to prevent duplicates)
    java.util.Optional<Donation> findByStripePaymentId(String stripePaymentId);
}