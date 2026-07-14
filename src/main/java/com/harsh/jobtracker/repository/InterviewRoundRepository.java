package com.harsh.jobtracker.repository;

import com.harsh.jobtracker.model.InterviewRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRoundRepository extends JpaRepository<InterviewRound, Long> {

    List<InterviewRound> findByApplicationIdOrderByRoundOrderAsc(Long applicationId);

    long countByApplicationIdAndStatus(Long applicationId, String status);

    long countByApplicationId(Long applicationId);

    void deleteByApplicationId(Long applicationId);
}
