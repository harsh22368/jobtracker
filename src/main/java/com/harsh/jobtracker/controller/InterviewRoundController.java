package com.harsh.jobtracker.controller;

import com.harsh.jobtracker.dto.ApiResponse;
import com.harsh.jobtracker.dto.InterviewRoundDTO;
import com.harsh.jobtracker.service.InterviewRoundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications/{appId}/rounds")
@RequiredArgsConstructor
@Tag(name = "Interview Rounds", description = "APIs for managing interview rounds per application")
public class InterviewRoundController {

    private final InterviewRoundService service;

    @GetMapping
    @Operation(summary = "Get all interview rounds for an application")
    public ResponseEntity<ApiResponse<List<InterviewRoundDTO>>> getRounds(@PathVariable Long appId) {
        List<InterviewRoundDTO> rounds = service.getRounds(appId);
        return ResponseEntity.ok(ApiResponse.success("Rounds fetched successfully", rounds));
    }

    @PostMapping
    @Operation(summary = "Add interview rounds (batch) for an application")
    public ResponseEntity<ApiResponse<List<InterviewRoundDTO>>> addRounds(
            @PathVariable Long appId,
            @RequestBody List<InterviewRoundDTO> rounds) {
        List<InterviewRoundDTO> saved = service.addRounds(appId, rounds);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rounds added successfully", saved));
    }

    @PutMapping("/{roundId}")
    @Operation(summary = "Update an interview round")
    public ResponseEntity<ApiResponse<InterviewRoundDTO>> updateRound(
            @PathVariable Long appId,
            @PathVariable Long roundId,
            @RequestBody InterviewRoundDTO dto) {
        InterviewRoundDTO updated = service.updateRound(appId, roundId, dto);
        return ResponseEntity.ok(ApiResponse.success("Round updated successfully", updated));
    }

    @DeleteMapping("/{roundId}")
    @Operation(summary = "Delete an interview round")
    public ResponseEntity<ApiResponse<Void>> deleteRound(
            @PathVariable Long appId,
            @PathVariable Long roundId) {
        service.deleteRound(appId, roundId);
        return ResponseEntity.ok(ApiResponse.success("Round deleted successfully", null));
    }
}
