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
  "UI Developer", "UX Designer", "UI/UX Designer"
];

/**
 * Extract skills from JD text using comprehensive dictionary matching
 * @param {string} text - Input text
 * @returns {string[]} - Array of normalized skills found
 */
function extractSkills(text) {
  if (!text) return [];
  
  const processedText = preprocessText(text);
  const foundSkills = new Set();
  const aliases = getSkillAliases();
  
  // Check all alias variations
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (alias.length === 1 && !['r', 'c'].includes(alias)) continue;
    
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedAlias}\\b`, 'i');
    
    if (regex.test(processedText)) {
      foundSkills.add(canonical);
    }
  }
  
  // Also check the skills list directly
  skills.forEach(skill => {
    if (skill.length <= 2) return;
    
    const normalizedSkill = normalizeSkill(skill);
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    if (regex.test(processedText)) {
      foundSkills.add(normalizedSkill);
    }
  });
  
  const result = [...foundSkills];
  console.log("[jdParser.js] JD Skills extracted:", result.length, "skills");
  return result;
}

/**
 * Extract job role/title from JD text
 * Uses multiple strategies for better accuracy
 * @param {string} text - JD text
 * @returns {string|null} - Job role or null
 */
function extractRole(text) {
  if (!text) return null;
  
  const textLower = text.toLowerCase();
  
  // Strategy 1: Look for explicit role/title labels
  const labelPatterns = [
    /(?:job\s*title|position|role)\s*[:=\-–]\s*([^\n\r.]+)/i,
    /(?:we(?:'re| are)\s+(?:looking\s+for|hiring|seeking)\s+(?:an?\s+)?)((?:senior\s+|junior\s+|lead\s+|staff\s+|principal\s+)?[a-z\s]+(?:developer|engineer|manager|analyst|architect|designer|specialist|administrator|lead))/i,
    /(?:title|position)\s*[:=]\s*"?([^"\n\r]+)"?/i
  ];
  
  for (const pattern of labelPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const role = match[1].trim().replace(/[.,;!\n\r]+$/, '').trim();
      if (role.length > 3 && role.length < 60) {
        return role;
      }
    }
  }
  
  // Strategy 2: Match against known job titles
  for (const title of JOB_TITLES) {
    const titleLower = title.toLowerCase();
    if (textLower.includes(titleLower)) {
      // Try to get with seniority prefix
      const seniorityPattern = new RegExp(
        `((?:senior|junior|lead|staff|principal|mid-level|entry-level|sr\\.?|jr\\.?)\\s+)?${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'i'
      );
      const match = text.match(seniorityPattern);
      if (match) {
        return match[0].trim();
      }
      return title;
    }
  }
  
  // Strategy 3: Look for pattern "X Developer" or "X Engineer" in first few lines
  const lines = text.split('\n').slice(0, 15);
  for (const line of lines) {
    const rolePattern = /\b((?:senior|junior|lead|staff|principal)?\s*[a-z]+\s+(?:developer|engineer|manager|analyst|architect|specialist))\b/i;
    const match = line.match(rolePattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Extract job description/about role with better section detection
 * @param {string} text - JD text
 * @returns {string|null} - About role text
 */
function extractAboutRole(text) {
  if (!text) return null;
  
  // Section markers that indicate responsibilities/description
  const sectionPatterns = [
    /(?:job\s+description|about\s+(?:the\s+)?role|overview|summary)\s*[:=\-–]?\s*\n?([\s\S]+?)(?=\n\s*(?:requirements|qualifications|skills|experience|responsibilities|what\s+you|we\s+offer|benefits|about\s+us)|$)/i,
    /(?:responsibilities|what\s+you(?:'ll|\s+will)\s+do|duties)\s*[:=\-–]?\s*\n?([\s\S]+?)(?=\n\s*(?:requirements|qualifications|skills|experience|what\s+you|we\s+offer|benefits|about\s+us)|$)/i,
    /(?:the\s+role|this\s+position)\s*[:=\-–]?\s*\n?([\s\S]+?)(?=\n\s*(?:requirements|qualifications|skills|experience|responsibilities|what\s+you)|$)/i
  ];
  
  for (const pattern of sectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let about = match[1]
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^\s*[-•·]\s*/, '')
        .slice(0, 500);
      
      if (about.length > 30) {
        return about;
      }
    }
  }
  
  // Fallback: Get first substantial paragraph
  const paragraphs = text.split(/\n\s*\n/);
  for (const para of paragraphs.slice(0, 3)) {
    const cleaned = para.trim().replace(/\s+/g, ' ');
    if (cleaned.length > 50 && cleaned.length < 600) {
      // Skip if it's just a title or header
      if (!/^(requirements|qualifications|skills|about us|company|benefits)/i.test(cleaned)) {
        return cleaned.slice(0, 500);
      }
    }
  }
  
  return text.trim().slice(0, 300);
}

/**
 * Parse Job Description text to extract structured data
 * @param {string} text - Raw JD text
 * @returns {Object} - Parsed JD data
 */
function parseJD(text) {
  console.log("[jdParser.js] parseJD called");
  
  if (!text) {
    console.log("[jdParser.js] Empty JD text provided");
    return {
      role: null,
      aboutRole: null,
      jdSkills: [],
      salary: null,
      experienceRequired: null
    };
  }
  
  const role = extractRole(text);
  const aboutRole = extractAboutRole(text);
  const jdSkills = extractSkills(text);
  const salary = extractSalary(text);
  const experienceRequired = extractExperience(text);
  
  console.log("[jdParser.js] Role:", role);
  console.log("[jdParser.js] About role length:", aboutRole ? aboutRole.length : 0);
  console.log("[jdParser.js] Skills:", jdSkills.length);
  console.log("[jdParser.js] Salary:", salary);
  console.log("[jdParser.js] Experience:", experienceRequired);
  
  return {
    role,
    aboutRole,
    jdSkills,
    salary,
    experienceRequired
  };
}

module.exports = {
  parseJD,
  extractSkills
};