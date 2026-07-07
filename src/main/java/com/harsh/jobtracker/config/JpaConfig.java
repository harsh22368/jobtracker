package com.harsh.jobtracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuration class for JPA Auditing.
 * Enables the automatic populating of @CreatedDate and @LastModifiedDate fields in our entities.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
