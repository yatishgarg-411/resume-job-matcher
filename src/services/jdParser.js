const skills = require("../utils/skillList");
const { extractSalary, extractExperience } = require("../utils/regexUtils");
const { normalizeSkill, preprocessText, getSkillAliases } = require("../utils/skillNormalizer");

// Common job titles for better matching
const JOB_TITLES = [
  "Software Engineer", "Software Developer", "Full Stack Developer",
  "Frontend Developer", "Backend Developer", "Full-Stack Developer",
  "Front-End Developer", "Back-End Developer", "Web Developer",
  "Data Scientist", "Data Engineer", "Data Analyst",
  "DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer",
  "Machine Learning Engineer", "AI Engineer", "ML Engineer",
  "QA Engineer", "Test Engineer", "Quality Assurance Engineer",
  "Product Manager", "Project Manager", "Engineering Manager",
  "Tech Lead", "Team Lead", "Technical Lead",
  "System Administrator", "Database Administrator", "DBA",
  "Security Engineer", "Network Engineer", "Platform Engineer",
  "Mobile Developer", "iOS Developer", "Android Developer",
  "UI Developer", "UX Designer", "UI/UX Designer",
  "Business Analyst", "Graduate Trainee"
];

/**
 * Skills that are too short / ambiguous for simple \b matching.
 * These need special context-aware logic below.
 */
const STRICT_MATCH_SKILLS = new Set(["r", "c", "go", "less"]);

/**
 * Dotted skills (e.g. "next.js", "node.js", "vue.js") —
 * the literal dot must appear in source text to count.
 */
const DOTTED_SKILLS = new Set(
  skills.filter(s => s.includes(".")).map(s => s.toLowerCase())
);

/**
 * Extract skills from JD text using comprehensive dictionary matching
 */
function extractSkills(text) {
  if (!text) return [];

  const processedText = preprocessText(text);
  const originalLower = text.toLowerCase();
  const foundSkills = new Set();
  const aliases = getSkillAliases();

  // --- Pass 1: Check alias table ---
  for (const [alias, canonical] of Object.entries(aliases)) {
    // Skip single-char aliases (handled by strict matching below)
    if (alias.length <= 1) continue;

    // Skip strict-match skills
    if (STRICT_MATCH_SKILLS.has(canonical)) continue;

    // For dotted aliases (next.js, node.js, etc.) — require literal match in original text
    if (alias.includes(".")) {
      if (originalLower.includes(alias)) {
        foundSkills.add(canonical);
      }
      continue;
    }

    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp("\\b" + escapedAlias + "\\b", "i");
    if (regex.test(processedText)) {
      foundSkills.add(canonical);
    }
  }

  // --- Pass 2: Check skills list directly ---
  for (const skill of skills) {
    const normalized = normalizeSkill(skill);

    // Skip strict-match skills
    if (STRICT_MATCH_SKILLS.has(normalized)) continue;
    if (STRICT_MATCH_SKILLS.has(skill.toLowerCase())) continue;  

    // Skip very short skills (2 chars or less)
    if (skill.length <= 2) continue;

    // Dotted skills — literal match only
    if (DOTTED_SKILLS.has(skill.toLowerCase())) {
      if (originalLower.includes(skill.toLowerCase())) {
        foundSkills.add(normalized);
      }
      continue;
    }

    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp("\\b" + escapedSkill + "\\b", "i");
    if (regex.test(processedText)) {
      foundSkills.add(normalized);
    }
  }

  // --- Pass 3: Strict matching for short / ambiguous skills ---

  // "R" language — only when explicitly listed as a programming language
  if (/\bproficiency\s+in\s+(?:python\s+or\s+r|r\s+or\s+python)\b/i.test(text) ||
      /\b(?:r)\b\s+(?:for\s+data|language|programming|studio)/i.test(text) ||
      /\blanguages?\s*[:\-–]?[^.\n]{0,60}\br\b/i.test(text) ||
      /\b(?:python|sql|excel)[,\s]+(?:and\s+)?r\b/i.test(text) ||
      /\br[,\s]+(?:and\s+)?(?:python|sql|excel)\b/i.test(text)) {
    foundSkills.add("r");
  }

  // "C" language — only near explicit language context
  if (/\blanguages?\s*[:\-–]?[^.\n]{0,80}\bc\b/i.test(text) ||
      /\bc\b\s*[,\/|]\s*(?:c\+\+|java|python)/i.test(text)) {
    foundSkills.add("c");
  }

  // "Go" — only "golang" or "go lang" or "go programming"
  if (/\bgolang\b/i.test(text) ||
      /\bgo\s+(?:lang|language|programming)\b/i.test(text)) {
    foundSkills.add("go");
  }

  // "SQL" — make sure it's detected (sometimes preprocessText strips context)
  if (/\bsql\b/i.test(text)) {
    foundSkills.add("sql");
  }

  const result = [...foundSkills];
  console.log("[jdParser.js] JD Skills extracted:", result.length, "skills");
  return result;
}

/**
 * Extract job role/title from JD text
 */
function extractRole(text) {
  if (!text) return null;

  const textLower = text.toLowerCase();

  // Strategy 1: Explicit label like "Position: Graduate Trainee Business Analyst"
  const labelPatterns = [
    /(?:job\s*title|position|role|designation)\s*[:=\-–]\s*([^\n\r.]+)/i,
    /(?:we(?:'re| are)\s+(?:looking\s+for|hiring|seeking)\s+(?:an?\s+)?)((?:senior\s+|junior\s+|lead\s+|staff\s+|principal\s+|graduate\s+)?[a-z\s]+(?:developer|engineer|manager|analyst|architect|designer|specialist|administrator|lead|trainee))/i,
    /(?:title|position)\s*[:=]\s*"?([^"\n\r]+)"?/i,
  ];

  for (const pattern of labelPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const role = match[1].trim().replace(/[.,;!\n\r]+$/, "").trim();
      if (role.length > 3 && role.length < 80) {
        return role;
      }
    }
  }

  // Strategy 2: Known job titles
  for (const title of JOB_TITLES) {
    const titleLower = title.toLowerCase();
    if (textLower.includes(titleLower)) {
      const seniorityPattern = new RegExp(
        "((?:senior|junior|lead|staff|principal|mid-level|entry-level|graduate|sr\\.?|jr\\.?)\\s+)?" +
        title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      const match = text.match(seniorityPattern);
      if (match) return match[0].trim();
      return title;
    }
  }

  // Strategy 3: First few lines with role-like pattern
  const lines = text.split("\n").slice(0, 15);
  for (const line of lines) {
    const rolePattern = /\b((?:senior|junior|lead|staff|principal|graduate)?\s*[a-z]+\s+(?:developer|engineer|manager|analyst|architect|specialist|trainee))\b/i;
    const match = line.match(rolePattern);
    if (match) return match[1].trim();
  }

  return null;
}

/**
 * Extract about role summary
 */
function extractAboutRole(text) {
  if (!text) return null;

  const sectionPatterns = [
    /(?:position\s+overview|about\s+(?:the\s+)?role|role\s+overview|job\s+description|overview|summary)\s*[:=\-–]?\s*\n?([\s\S]+?)(?=\n\s*(?:requirements|qualifications|skills|experience|responsibilities|what\s+you|we\s+offer|benefits|about\s+us|key\s+responsibilities)|$)/i,
    /(?:responsibilities|what\s+you(?:'ll|\s+will)\s+do|duties|key\s+responsibilities)\s*[:=\-–]?\s*\n?([\s\S]+?)(?=\n\s*(?:requirements|qualifications|skills|experience|what\s+you|we\s+offer|benefits|about\s+us)|$)/i,
  ];

  for (const pattern of sectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let about = match[1].trim().replace(/\s+/g, " ").slice(0, 500);
      if (about.length > 30) return about;
    }
  }

  // Fallback: first substantial paragraph
  const paragraphs = text.split(/\n\s*\n/);
  for (const para of paragraphs.slice(0, 3)) {
    const cleaned = para.trim().replace(/\s+/g, " ");
    if (cleaned.length > 50 && cleaned.length < 600) {
      if (!/^(requirements|qualifications|skills|about us|company|benefits)/i.test(cleaned)) {
        return cleaned.slice(0, 500);
      }
    }
  }

  return text.trim().slice(0, 300);
}

/**
 * Parse Job Description text to extract structured data
 */
function parseJD(text) {
  console.log("[jdParser.js] parseJD called");

  if (!text) {
    console.log("[jdParser.js] Empty JD text provided");
    return { role: null, aboutRole: null, jdSkills: [], salary: null, experienceRequired: null };
  }

  const role               = extractRole(text);
  const aboutRole          = extractAboutRole(text);
  const jdSkills           = extractSkills(text);
  const salary             = extractSalary(text);
  const experienceRequired = extractExperience(text);

  console.log("[jdParser.js] Role:", role);
  console.log("[jdParser.js] About role length:", aboutRole ? aboutRole.length : 0);
  console.log("[jdParser.js] Skills:", jdSkills.length);
  console.log("[jdParser.js] Salary:", salary);
  console.log("[jdParser.js] Experience:", experienceRequired);

  return { role, aboutRole, jdSkills, salary, experienceRequired };
}

module.exports = { parseJD, extractSkills };
