package com.harsh.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JdParseRequestDTO {

    @NotBlank(message = "Job description text is required")
    @Size(max = 20000, message = "Job description cannot exceed 20000 characters")
    private String rawText;
}
