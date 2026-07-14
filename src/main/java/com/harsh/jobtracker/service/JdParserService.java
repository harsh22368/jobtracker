package com.harsh.jobtracker.service;

import com.harsh.jobtracker.dto.JdParseResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Regex + keyword-based JD parser.
 * Extracts structured data from raw job description text.
 * Returns null for any field it cannot confidently extract — never guesses.
 */
@Slf4j
@Service
public class JdParserService {

    // Common section headers in job descriptions (case-insensitive)
    private static final List<SectionPattern> SECTION_PATTERNS = List.of(
            // About Company
            new SectionPattern("aboutCompany", List.of(
                    "about us", "about the company", "about \\w+", "who we are",
                    "company overview", "company description", "our story"
            )),
            // Responsibilities
            new SectionPattern("responsibilities", List.of(
                    "responsibilities", "what you.?ll do", "what you will do",
                    "key responsibilities", "role responsibilities", "your role",
                    "job duties", "duties", "what you.?ll be doing",
                    "day to day", "day-to-day", "in this role"
            )),
            // Requirements
            new SectionPattern("requirements", List.of(
                    "requirements", "what we.?re looking for", "what we are looking for",
                    "must have", "must-have", "essential requirements",
                    "what you.?ll need", "what you need", "what you will need",
                    "minimum requirements", "basic requirements"
            )),
            // Qualifications
            new SectionPattern("qualifications", List.of(
                    "qualifications", "education", "educational requirements",
                    "preferred qualifications", "required qualifications",
                    "desired qualifications", "minimum qualifications",
                    "eligibility", "eligibility criteria"
            )),
            // Skills
            new SectionPattern("skills", List.of(
                    "skills", "technical skills", "required skills",
                    "key skills", "core skills", "skills required",
                    "tech stack", "technologies", "tools & technologies",
                    "tools and technologies", "competencies"
            ))
    );

    // Employment type keywords
    private static final Map<String, String> EMPLOYMENT_TYPES = new LinkedHashMap<>() {{
        put("full[\\s-]?time", "Full-time");
        put("part[\\s-]?time", "Part-time");
        put("internship", "Internship");
        put("intern\\b", "Internship");
        put("contract", "Contract");
        put("freelance", "Freelance");
        put("temporary", "Contract");
    }};

    public JdParseResponseDTO parse(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return JdParseResponseDTO.builder().build();
        }

        log.info("Parsing JD text ({} chars)", rawText.length());

        String text = rawText.trim();

        // Extract sections
        Map<String, String> sections = extractSections(text);

        // Extract individual fields
        String company = extractCompany(text);
        String role = extractRole(text);
        String location = extractLocation(text);
        String employmentType = extractEmploymentType(text);
        List<String> skills = extractSkills(text, sections.get("skills"));

        return JdParseResponseDTO.builder()
                .company(company)
                .role(role)
                .location(location)
                .employmentType(employmentType)
                .qualifications(sections.get("qualifications"))
                .requirements(sections.get("requirements"))
                .responsibilities(sections.get("responsibilities"))
                .aboutCompany(sections.get("aboutCompany"))
                .skills(skills.isEmpty() ? null : skills)
                .build();
    }

    /**
     * Splits JD text into sections based on common headers.
     */
    private Map<String, String> extractSections(String text) {
        Map<String, String> result = new HashMap<>();

        // Build a combined pattern of all section headers
        List<SectionMatch> matches = new ArrayList<>();

        for (SectionPattern sp : SECTION_PATTERNS) {
            for (String headerPattern : sp.headerPatterns) {
                // Match headers that appear at start of line, possibly with colons, dashes, or markdown
                String regex = "(?im)^[\\s#*-]*(" + headerPattern + ")[:\\s*-]*$";
                Pattern p = Pattern.compile(regex);
                Matcher m = p.matcher(text);
                while (m.find()) {
                    matches.add(new SectionMatch(sp.sectionName, m.start(), m.end()));
                }
            }
        }

        // Sort by position in text
        matches.sort(Comparator.comparingInt(a -> a.start));

        // Extract content between section headers
        for (int i = 0; i < matches.size(); i++) {
            SectionMatch current = matches.get(i);
            int contentStart = current.end;
            int contentEnd = (i + 1 < matches.size()) ? matches.get(i + 1).start : text.length();

            String content = text.substring(contentStart, contentEnd).trim();
            content = cleanSectionContent(content);

            if (!content.isBlank() && !result.containsKey(current.sectionName)) {
                result.put(current.sectionName, content);
            }
        }

        return result;
    }

    /**
     * Extracts company name from common JD patterns.
     */
    private String extractCompany(String text) {
        // Pattern: "About {Company}" or "About {Company}:"
        Pattern aboutPattern = Pattern.compile(
                "(?i)(?:about|join|welcome to)\\s+([A-Z][A-Za-z0-9&.\\s]{1,50}?)(?:\\s*[-:;,.|]|\\s+is\\b|\\s+was\\b|\\n)",
                Pattern.MULTILINE
        );
        Matcher m = aboutPattern.matcher(text);
        if (m.find()) {
            String name = m.group(1).trim();
            // Filter out generic words that aren't company names
            if (!isGenericWord(name) && name.length() > 1) {
                return name;
            }
        }

        // Pattern: "Company: {name}" or "Company Name: {name}"
        Pattern companyLabel = Pattern.compile(
                "(?i)(?:company(?:\\s*name)?|organization|employer)\\s*[:\\-]\\s*(.+?)(?:\\n|$)"
        );
        m = companyLabel.matcher(text);
        if (m.find()) {
            String name = m.group(1).trim();
            if (!name.isBlank() && name.length() <= 80) {
                return name;
            }
        }

        // Pattern: "{Company} is hiring" or "{Company} is looking"
        Pattern hiringPattern = Pattern.compile(
                "(?i)^([A-Z][A-Za-z0-9&.\\s]{1,50}?)\\s+(?:is\\s+(?:hiring|looking|seeking|recruiting))",
                Pattern.MULTILINE
        );
        m = hiringPattern.matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }

        return null;
    }

    /**
     * Extracts role/job title from common patterns.
     */
    private String extractRole(String text) {
        // Pattern: "Job Title: ..." or "Position: ..." or "Role: ..."
        Pattern titleLabel = Pattern.compile(
                "(?i)(?:job\\s*title|position|role|designation)\\s*[:\\-]\\s*(.+?)(?:\\n|$)"
        );
        Matcher m = titleLabel.matcher(text);
        if (m.find()) {
            String role = m.group(1).trim();
            if (!role.isBlank() && role.length() <= 120) {
                return role;
            }
        }

        // Often the first line or first prominent line is the title
        String[] lines = text.split("\\n");
        for (String line : lines) {
            line = line.replaceAll("[#*]", "").trim();
            if (line.isBlank() || line.length() > 120 || line.length() < 3) continue;

            // Check if line looks like a job title (contains role keywords)
            if (looksLikeJobTitle(line)) {
                return line;
            }
            break; // Only check the first non-empty line for title
        }

        return null;
    }

    /**
     * Extracts location from the JD text.
     */
    private String extractLocation(String text) {
        // Pattern: "Location: ..." or "Job Location: ..."
        Pattern locLabel = Pattern.compile(
                "(?i)(?:location|job\\s*location|office|work\\s*location|based\\s*(?:in|at))\\s*[:\\-]\\s*(.+?)(?:\\n|$)"
        );
        Matcher m = locLabel.matcher(text);
        if (m.find()) {
            String loc = m.group(1).trim();
            if (!loc.isBlank() && loc.length() <= 120) {
                return loc;
            }
        }

        // Check for Remote/Hybrid/Onsite keywords
        Pattern workMode = Pattern.compile("(?i)\\b(fully\\s*remote|remote|hybrid|on[\\s-]?site|work\\s*from\\s*home)\\b");
        m = workMode.matcher(text);
        if (m.find()) {
            return capitalizeFirst(m.group(1).trim());
        }

        return null;
    }

    /**
     * Extracts employment type from keywords.
     */
    private String extractEmploymentType(String text) {
        for (Map.Entry<String, String> entry : EMPLOYMENT_TYPES.entrySet()) {
            Pattern p = Pattern.compile("(?i)\\b" + entry.getKey() + "\\b");
            if (p.matcher(text).find()) {
                return entry.getValue();
            }
        }
        return null;
    }

    /**
     * Extracts skills from the skills section or from bullet points.
     */
    private List<String> extractSkills(String fullText, String skillsSection) {
        Set<String> skills = new LinkedHashSet<>();

        String source = skillsSection != null ? skillsSection : fullText;

        // Extract from comma-separated lists or bullet points
        // Look for lines with technical keywords
        String[] lines = source.split("\\n");
        for (String line : lines) {
            line = line.replaceAll("^[\\s•●○▪▸\\-*]+", "").trim();
            if (line.isBlank()) continue;

            // If the line has commas and looks like a skill list
            if (line.contains(",") && line.length() < 300) {
                String[] parts = line.split(",");
                for (String part : parts) {
                    String skill = part.replaceAll("[()\\[\\]]", "").trim();
                    if (isLikelySkill(skill)) {
                        skills.add(skill);
                    }
                }
            } else if (skillsSection != null && line.length() < 80) {
                // In the skills section, each bullet is likely a skill
                String skill = line.replaceAll("[()\\[\\]]", "").trim();
                if (isLikelySkill(skill)) {
                    skills.add(skill);
                }
            }
        }

        return new ArrayList<>(skills);
    }

    // ── Helper methods ──

    private String cleanSectionContent(String content) {
        // Remove leading/trailing whitespace and excessive blank lines
        return content.replaceAll("\\n{3,}", "\n\n").trim();
    }

    private boolean isGenericWord(String text) {
        Set<String> generic = Set.of(
                "us", "the company", "the team", "our team",
                "this role", "the role", "you", "your"
        );
        return generic.contains(text.toLowerCase().trim());
    }

    private boolean looksLikeJobTitle(String line) {
        String lower = line.toLowerCase();
        return lower.contains("engineer") || lower.contains("developer") ||
                lower.contains("manager") || lower.contains("analyst") ||
                lower.contains("designer") || lower.contains("intern") ||
                lower.contains("associate") || lower.contains("lead") ||
                lower.contains("architect") || lower.contains("consultant") ||
                lower.contains("specialist") || lower.contains("coordinator") ||
                lower.contains("executive") || lower.contains("officer") ||
                lower.contains("sde") || lower.contains("swe") ||
                lower.contains("scientist") || lower.contains("researcher");
    }

    private boolean isLikelySkill(String text) {
        if (text == null || text.isBlank() || text.length() < 2 || text.length() > 60) {
            return false;
        }
        // Filter out sentences (skills are usually short phrases)
        long wordCount = text.split("\\s+").length;
        return wordCount <= 5;
    }

    private String capitalizeFirst(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    // ── Inner classes ──

    private record SectionPattern(String sectionName, List<String> headerPatterns) {}
    private record SectionMatch(String sectionName, int start, int end) {}
}
