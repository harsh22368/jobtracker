package com.harsh.jobtracker.service;

import com.harsh.jobtracker.dto.InterviewRoundDTO;
import com.harsh.jobtracker.exception.ResourceNotFoundException;
import com.harsh.jobtracker.model.Application;
import com.harsh.jobtracker.model.InterviewRound;
import com.harsh.jobtracker.repository.ApplicationRepository;
import com.harsh.jobtracker.repository.InterviewRoundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewRoundService {

    private final InterviewRoundRepository roundRepository;
    private final ApplicationRepository applicationRepository;

    public List<InterviewRoundDTO> getRounds(Long applicationId) {
        log.info("Fetching rounds for application ID: {}", applicationId);
        verifyApplicationExists(applicationId);
        return roundRepository.findByApplicationIdOrderByRoundOrderAsc(applicationId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<InterviewRoundDTO> addRounds(Long applicationId, List<InterviewRoundDTO> roundDTOs) {
        log.info("Adding {} rounds for application ID: {}", roundDTOs.size(), applicationId);
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        List<InterviewRound> rounds = roundDTOs.stream()
                .map(dto -> InterviewRound.builder()
                        .application(app)
                        .roundName(dto.getRoundName())
                        .roundOrder(dto.getRoundOrder())
                        .status("PENDING")
                        .scheduledDate(parseDateTime(dto.getScheduledDate()))
                        .notes(dto.getNotes())
                        .build())
                .collect(Collectors.toList());

        List<InterviewRound> saved = roundRepository.saveAll(rounds);

        // Update application status to Shortlisted if it isn't already
        if (!"Shortlisted".equals(app.getStatus()) && !"Offer".equals(app.getStatus())) {
            app.setStatus("Shortlisted");
            applicationRepository.save(app);
        }

        return saved.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public InterviewRoundDTO updateRound(Long applicationId, Long roundId, InterviewRoundDTO dto) {
        log.info("Updating round ID: {} for application ID: {}", roundId, applicationId);
        verifyApplicationExists(applicationId);

        InterviewRound round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round not found with id: " + roundId));

        if (dto.getRoundName() != null) round.setRoundName(dto.getRoundName());
        if (dto.getRoundOrder() != null) round.setRoundOrder(dto.getRoundOrder());
        if (dto.getStatus() != null) round.setStatus(dto.getStatus());
        if (dto.getScheduledDate() != null) round.setScheduledDate(parseDateTime(dto.getScheduledDate()));
        if (dto.getNotes() != null) round.setNotes(dto.getNotes());

        InterviewRound updated = roundRepository.save(round);

        // Check if all rounds are completed → auto-move to Offer
        checkAndUpdateOfferStatus(applicationId);

        return toDTO(updated);
    }

    @Transactional
    public void deleteRound(Long applicationId, Long roundId) {
        log.info("Deleting round ID: {} for application ID: {}", roundId, applicationId);
        verifyApplicationExists(applicationId);

        if (!roundRepository.existsById(roundId)) {
            throw new ResourceNotFoundException("Round not found with id: " + roundId);
        }
        roundRepository.deleteById(roundId);
    }

    /**
     * If ALL rounds for an application are COMPLETED, auto-update status to "Offer"
     */
    private void checkAndUpdateOfferStatus(Long applicationId) {
        long totalRounds = roundRepository.countByApplicationId(applicationId);
        long completedRounds = roundRepository.countByApplicationIdAndStatus(applicationId, "COMPLETED");

        if (totalRounds > 0 && totalRounds == completedRounds) {
            log.info("All {} rounds completed for application ID: {} — moving to Offer", totalRounds, applicationId);
            Application app = applicationRepository.findById(applicationId).orElse(null);
            if (app != null && !"Offer".equals(app.getStatus())) {
                app.setStatus("Offer");
                applicationRepository.save(app);
            }
        }
    }

    private void verifyApplicationExists(Long applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }
    }

    private InterviewRoundDTO toDTO(InterviewRound round) {
        InterviewRoundDTO dto = new InterviewRoundDTO();
        dto.setId(round.getId());
        dto.setRoundName(round.getRoundName());
        dto.setRoundOrder(round.getRoundOrder());
        dto.setStatus(round.getStatus());
        dto.setScheduledDate(round.getScheduledDate() != null
                ? round.getScheduledDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null);
        dto.setNotes(round.getNotes());
        dto.setCreatedAt(round.getCreatedAt());
        dto.setUpdatedAt(round.getUpdatedAt());
        return dto;
    }

    private LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            log.warn("Could not parse date: {}", dateStr);
            return null;
        }
    }
}
