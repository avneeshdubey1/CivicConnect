package com.civicconnect.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.civicconnect.backend.model.Complaint;
import com.civicconnect.backend.model.User;

import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {


}