package com.civicconnect.backend.dto;

import lombok.Data;

@Data
public class ComplaintCreateDto {
    private String title;
    private String description;
    private String area;
}
