package com.harsh.jobtracker.mapper;

import com.harsh.jobtracker.dto.ApplicationRequestDTO;
import com.harsh.jobtracker.dto.ApplicationResponseDTO;
import com.harsh.jobtracker.model.Application;
import org.mapstruct.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ApplicationMapper {

    @Mapping(target = "appliedDate", source = "appliedDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "resumeFile", ignore = true)
    @Mapping(target = "resumeFileName", ignore = true)
    Application toEntity(ApplicationRequestDTO dto);

    @Mapping(target = "hasResume", expression = "java(entity.getResumeFile() != null && entity.getResumeFile().length > 0)")
    ApplicationResponseDTO toResponseDTO(Application entity);

    @Mapping(target = "appliedDate", source = "appliedDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "resumeFile", ignore = true)
    @Mapping(target = "resumeFileName", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(ApplicationRequestDTO dto, @MappingTarget Application entity);

    @Named("stringToLocalDate")
    default LocalDate stringToLocalDate(String date) {
        if (date == null || date.isBlank()) return null;
        return LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE);
    }
}
