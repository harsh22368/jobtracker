package com.harsh.jobtracker.controller;

import com.harsh.jobtracker.dto.ApiResponse;
import com.harsh.jobtracker.dto.JdParseRequestDTO;
import com.harsh.jobtracker.dto.JdParseResponseDTO;
import com.harsh.jobtracker.service.JdParserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jd")
@RequiredArgsConstructor
@Tag(name = "JD Parser", description = "Parse raw job descriptions into structured data")
public class JdParseController {

    private final JdParserService parserService;

    @PostMapping("/parse")
    @Operation(summary = "Parse a raw job description into structured fields")
    public ResponseEntity<ApiResponse<JdParseResponseDTO>> parseJd(@Valid @RequestBody JdParseRequestDTO request) {
        JdParseResponseDTO parsed = parserService.parse(request.getRawText());
        return ResponseEntity.ok(ApiResponse.success("Job description parsed successfully", parsed));
    }
}
