package com.harsh.jobtracker.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ApplicationResponseDTO {

    private Long id;
    private String company;
    private String role;
    private String status;
    private String resumeVersion;
    private String platform;
    private String companyType;
    private LocalDate appliedDate;
    private String jobDescription;
    private String jobUrl;
    private String location;
    private String employmentType;
    private String currentStage;
    private String oaDetails;
    private String interviewQuestions;
    private String mistakes;
    private String improvements;
    private Integer priority;
    private String resumeFileName;
    private boolean hasResume; // true if a PDF resume is attached

    // V2: JD-parsed fields
    private String qualifications;
    private String requirements;
    private String responsibilities;
    private String aboutCompany;
    private String skills;

    // V2: Source tracking
    private String heardFrom;
    private String appliedThrough;

    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
}
