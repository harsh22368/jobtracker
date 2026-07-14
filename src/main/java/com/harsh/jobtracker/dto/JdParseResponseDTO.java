package com.harsh.jobtracker.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class JdParseResponseDTO {
    private String company;
    private String role;
    private String location;
    private String employmentType;
    private String qualifications;
    private String requirements;
    private String responsibilities;
    private String aboutCompany;
    private List<String> skills;
}
