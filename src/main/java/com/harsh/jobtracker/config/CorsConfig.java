package com.harsh.jobtracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for Global CORS (Cross-Origin Resource Sharing).
 * This allows our future React frontend (e.g., running on localhost:3000) 
 * to securely communicate with this backend API.
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Get the allowed origin from Render's environment variable, fallback to localhost for dev
                String allowedOrigin = System.getenv("ALLOWED_ORIGIN");
                if (allowedOrigin == null || allowedOrigin.isEmpty()) {
                    allowedOrigin = "http://localhost:5173";
                }

                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000", "http://localhost:5173", allowedOrigin)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
