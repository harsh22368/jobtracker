package com.harsh.jobtracker.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewRoundDTO {

    private Long id;

    private String roundName; // User types manually
    private Integer roundOrder;
    private String status; // PENDING or COMPLETED
    private String scheduledDate; // ISO format string for easier frontend handling
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
