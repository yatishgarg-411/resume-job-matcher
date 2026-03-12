const skills = require("../utils/skillList");
const { extractExperience, extractName, extractEmail, extractPhone } = require("../utils/regexUtils");
const { normalizeSkill, preprocessText, getSkillAliases } = require("../utils/skillNormalizer");

/**
 * Skills too short / ambiguous for simple \b matching.
 * These need special context-aware logic.
 */
const STRICT_MATCH_SKILLS = new Set(["r", "c", "go", "less"]);

/**
 * Dotted skills (next.js, node.js, vue.js) — require literal dot in text.
 */
const DOTTED_SKILLS = new Set(
  skills.filter(s => s.includes(".")).map(s => s.toLowerCase())
);

/**
 * Extract skills from text using comprehensive dictionary matching
 */
function extractSkills(text) {
  if (!text) return [];

  const processedText = preprocessText(text);
  const originalLower = text.toLowerCase();
  const foundSkills = new Set();
  const aliases = getSkillAliases();

  // --- Pass 1: Check alias table ---
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (alias.length <= 1) continue;
    if (STRICT_MATCH_SKILLS.has(canonical)) continue;

    // For dotted aliases — require literal match in original text
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

    if (STRICT_MATCH_SKILLS.has(normalized)) continue;
    if (STRICT_MATCH_SKILLS.has(skill.toLowerCase())) continue;
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

  // "R" language
  if (/\bproficiency\s+in\s+(?:python\s+or\s+r|r\s+or\s+python)\b/i.test(text) ||
      /\b(?:r)\b\s+(?:for\s+data|language|programming|studio)/i.test(text) ||
      /\blanguages?\s*[:\-–]?[^.\n]{0,60}\br\b/i.test(text) ||
      /\b(?:python|sql|excel)[,\s]+(?:and\s+)?r\b/i.test(text) ||
      /\br[,\s]+(?:and\s+)?(?:python|sql|excel)\b/i.test(text)) {
    foundSkills.add("r");
  }

  // "C" language
  if (/\blanguages?\s*[:\-–]?[^.\n]{0,80}\bc\b/i.test(text) ||
      /\bc\b\s*[,\/|]\s*(?:c\+\+|java|python)/i.test(text)) {
    foundSkills.add("c");
  }

  // "Go" language
  if (/\bgolang\b/i.test(text) ||
      /\bgo\s+(?:lang|language|programming)\b/i.test(text)) {
    foundSkills.add("go");
  }

  // "SQL" — make sure it's detected
  if (/\bsql\b/i.test(text)) {
    foundSkills.add("sql");
  }

  const result = [...foundSkills];
  console.log("[resumeParser.js] Skills extracted:", result.length, "skills");
  return result;
}

/**
 * Parse resume text (regex + dictionary-based)
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

module.exports = { parseResume, extractSkills };
