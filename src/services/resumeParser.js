const skills = require("../utils/skillList");
const { extractExperience, extractName, extractEmail, extractPhone } = require("../utils/regexUtils");
const { normalizeSkill, preprocessText, getSkillAliases } = require("../utils/skillNormalizer");

/**
 * Extract skills from text using comprehensive dictionary matching
 * Uses both alias patterns and direct skill matching
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
    // Skip single character aliases that could cause false positives
    if (alias.length === 1 && !['r', 'c'].includes(alias)) continue;
    
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Use word boundary for better accuracy
    const regex = new RegExp(`\\b${escapedAlias}\\b`, 'i');
    if (regex.test(processedText)) {
      foundSkills.add(canonical);
    }
  }
  
  // Also check the skills list directly
  skills.forEach(skill => {
    if (skill.length <= 2) return; // Skip very short skills
    
    const normalizedSkill = normalizeSkill(skill);
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    if (regex.test(processedText)) {
      foundSkills.add(normalizedSkill);
    }
  });
  
  const result = [...foundSkills];
  console.log("[resumeParser.js] Skills extracted:", result.length, "skills");
  return result;
}

/**
 * Parse resume text (regex + dictionary-based)
 * @param {string} text - Raw resume text
 * @returns {Object} - Parsed resume data
 */
function parseResume(text) {
  console.log("[resumeParser.js] parseResume called (sync)");
  
  if (!text) {
    return { name: null, email: null, phone: null, resumeSkills: [], experience: null };
  }
  
  const name = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const resumeSkills = extractSkills(text);
  const experience = extractExperience(text);
  
  console.log("[resumeParser.js] Name:", name);
  console.log("[resumeParser.js] Email:", email);
  console.log("[resumeParser.js] Experience:", experience);
  console.log("[resumeParser.js] Skills found:", resumeSkills.length);
  
  return { name, email, phone, resumeSkills, experience };
}

module.exports = {
  parseResume,
  extractSkills
};