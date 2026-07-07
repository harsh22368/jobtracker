package com.harsh.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApplicationRequestDTO {

    @NotBlank(message = "Company name is mandatory")
    @Size(max = 255, message = "Company name cannot exceed 255 characters")
    private String company;

    @NotBlank(message = "Role is mandatory")
    private String role;

    @NotBlank(message = "Status is mandatory")
    private String status;

    private String resumeVersion;
    private String platform;
    private String companyType;
    private String appliedDate; // Accepts "2025-07-06" format
    
    @Size(max = 5000, message = "Job description cannot exceed 5000 characters")
    private String jobDescription;
    
    private String jobUrl;
    private String location;
    private String employmentType;

    private String currentStage;

    @Size(max = 1000, message = "OA details cannot exceed 1000 characters")
    private String oaDetails;

    @Size(max = 2000, message = "Interview questions cannot exceed 2000 characters")
    private String interviewQuestions;

    @Size(max = 2000, message = "Mistakes cannot exceed 2000 characters")
    private String mistakes;

    @Size(max = 2000, message = "Improvements cannot exceed 2000 characters")
    private String improvements;

    private Integer priority;
}
