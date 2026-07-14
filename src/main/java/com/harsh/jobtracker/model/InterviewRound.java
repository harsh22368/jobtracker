package com.harsh.jobtracker.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_rounds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class InterviewRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(nullable = false)
    private String roundName; // User types manually (e.g., "Aptitude Test", "Coding Round")

    @Column(nullable = false)
    private Integer roundOrder; // Display order (1, 2, 3...)

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING or COMPLETED

    private LocalDateTime scheduledDate; // Optional: when the round is scheduled

    @Column(columnDefinition = "TEXT")
    private String notes; // Optional: feedback, notes about the round

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
