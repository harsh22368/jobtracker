package com.harsh.jobtracker.controller;

import com.harsh.jobtracker.dto.ApiResponse;
import com.harsh.jobtracker.dto.ApplicationRequestDTO;
import com.harsh.jobtracker.dto.ApplicationResponseDTO;
import com.harsh.jobtracker.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@Tag(name = "Job Applications", description = "APIs for managing job applications")
public class ApplicationController {

    private final ApplicationService service;

    @PostMapping
    @Operation(summary = "Create a new job application")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> save(@Valid @RequestBody ApplicationRequestDTO dto) {
        ApplicationResponseDTO savedApp = service.save(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application created successfully", savedApp));
    }

    @GetMapping
    @Operation(summary = "Get all applications with filtering, pagination, and sorting")
    public ResponseEntity<ApiResponse<Page<ApplicationResponseDTO>>> getAll(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String currentStage,
            @ParameterObject Pageable pageable) {

        Page<ApplicationResponseDTO> applications = service.getAll(company, status, currentStage, pageable);
        return ResponseEntity.ok(ApiResponse.success("Applications fetched successfully", applications));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a job application by ID")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> getById(@PathVariable Long id) {
        ApplicationResponseDTO app = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Application fetched successfully", app));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing job application")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationRequestDTO updatedApp) {

        ApplicationResponseDTO updated = service.update(id, updatedApp);
        return ResponseEntity.ok(ApiResponse.success("Application updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a job application by ID")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Application deleted successfully", null));
    }

    @PostMapping(value = "/{id}/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a resume PDF for an application")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> uploadResume(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) {

        ApplicationResponseDTO updated = service.uploadResume(id, file);
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded successfully", updated));
    }

    @GetMapping("/{id}/resume")
    @Operation(summary = "Download the resume PDF for an application")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        return service.downloadResume(id);
    }
}