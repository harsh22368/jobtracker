package com.harsh.jobtracker.service;

import com.harsh.jobtracker.dto.ApplicationRequestDTO;
import com.harsh.jobtracker.dto.ApplicationResponseDTO;
import com.harsh.jobtracker.exception.ResourceNotFoundException;
import com.harsh.jobtracker.mapper.ApplicationMapper;
import com.harsh.jobtracker.model.Application;
import com.harsh.jobtracker.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository repository;
    private final ApplicationMapper mapper;

    @Transactional
    public ApplicationResponseDTO save(ApplicationRequestDTO dto) {
        log.info("Creating new application for company: {}", dto.getCompany());
        Application app = mapper.toEntity(dto);
        Application savedApp = repository.save(app);
        log.info("Successfully created application with ID: {}", savedApp.getId());
        return mapper.toResponseDTO(savedApp);
    }

    public Page<ApplicationResponseDTO> getAll(String company, String status, String currentStage, Pageable pageable) {
        log.info("Fetching applications with filters - company: {}, status: {}, stage: {}", company, status, currentStage);

        Specification<Application> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (company != null && !company.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("company")), "%" + company.toLowerCase() + "%"));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.toLowerCase()));
            }
            if (currentStage != null && !currentStage.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("currentStage")), currentStage.toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return repository.findAll(spec, pageable).map(mapper::toResponseDTO);
    }

    @Transactional
    public ApplicationResponseDTO update(Long id, ApplicationRequestDTO dto) {
        log.info("Updating application with ID: {}", id);
        Application existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        mapper.updateEntityFromDto(dto, existing);
        Application updated = repository.save(existing);
        log.info("Successfully updated application with ID: {}", id);
        return mapper.toResponseDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting application with ID: {}", id);
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with id: " + id);
        }
        repository.deleteById(id);
        log.info("Successfully deleted application with ID: {}", id);
    }

    public ApplicationResponseDTO getById(Long id) {
        log.info("Fetching application with ID: {}", id);
        Application app = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        return mapper.toResponseDTO(app);
    }

    @Transactional
    public ApplicationResponseDTO uploadResume(Long id, MultipartFile file) {
        log.info("Uploading resume for application ID: {}", id);
        Application app = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        try {
            app.setResumeFile(file.getBytes());
            app.setResumeFileName(file.getOriginalFilename());
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload resume: " + e.getMessage());
        }

        Application updated = repository.save(app);
        log.info("Resume uploaded for application ID: {}", id);
        return mapper.toResponseDTO(updated);
    }

    public ResponseEntity<byte[]> downloadResume(Long id) {
        Application app = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        if (app.getResumeFile() == null) {
            throw new ResourceNotFoundException("No resume found for application with id: " + id);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + app.getResumeFileName() + "\"")
                .body(app.getResumeFile());
    }
}