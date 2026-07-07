package com.harsh.jobtracker.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String company;
    private String role;
    private String status;
    private String resumeVersion;
    private String platform; // LinkedIn, Naukri, Wellfound, Career Page, Referral, etc.
    private String companyType; // Service Based, Product Based, Startup, Small Startup

    private LocalDate appliedDate;

    @Column(length = 5000)
    private String jobDescription;

    private String jobUrl;
    private String location;
    private String employmentType; // Full-time, Internship, Contract

    private String currentStage;

    @Column(length = 1000)
    private String oaDetails;

    @Column(length = 2000)
    private String interviewQuestions;

    @Column(length = 2000)
    private String mistakes;

    @Column(length = 2000)
    private String improvements;

    private String resumeFileName; // Original PDF file name
    
    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.VARBINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] resumeFile; // PDF binary data

    private Integer priority; // 1-5

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime lastUpdated;
}