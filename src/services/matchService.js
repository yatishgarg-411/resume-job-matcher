const { normalizeSkill } = require("../utils/skillNormalizer");

/**
 * Match resume skills against JD skills and calculate matching score
 * Uses normalized skill comparison for better accuracy
 * @param {string[]} resumeSkills - Skills from resume (already normalized)
 * @param {string[]} jdSkills - Skills from JD (already normalized)
 * @returns {Object} - Skills analysis and matching score
 */
function matchSkills(resumeSkills, jdSkills) {
  console.log("[matchService.js] matchSkills called");
  console.log("[matchService.js] Resume skills:", resumeSkills);
  console.log("[matchService.js] JD skills:", jdSkills);
  
  // Handle edge cases
  if (!Array.isArray(resumeSkills)) resumeSkills = [];
  if (!Array.isArray(jdSkills)) jdSkills = [];
  
  // Normalize all skills for comparison (in case they weren't already)
  const normalizedResumeSkills = resumeSkills.map(s => normalizeSkill(s));
  const normalizedJdSkills = jdSkills.map(s => normalizeSkill(s));
  
  const skillsAnalysis = [];
  
  normalizedJdSkills.forEach(skill => {
    const present = normalizedResumeSkills.includes(skill);
    skillsAnalysis.push({
      skill: skill,
      presentInResume: present
    });
  });
  
  const matchedSkills = skillsAnalysis.filter(s => s.presentInResume).length;
  const totalJdSkills = normalizedJdSkills.length;
  
  // Calculate score with bounds validation (0-100)
  let score = 0;
  if (totalJdSkills > 0) {
    score = (matchedSkills / totalJdSkills) * 100;
    // Clamp to 0-100 range
    score = Math.max(0, Math.min(100, score));
  }
  
  const matchingScore = Math.round(score);
  
  console.log("[matchService.js] Matched skills:", matchedSkills, "/", totalJdSkills);
  console.log("[matchService.js] Matching score:", matchingScore);
  console.log("[matchService.js] Skills analysis:", skillsAnalysis);
  
  return {
    skillsAnalysis,
    matchingScore,
    matchedCount: matchedSkills,
    totalRequired: totalJdSkills
  };
}

/**
 * Generate a summary of the match result
 * @param {number} score - Matching score
 * @returns {string} - Match summary
 */
function getMatchSummary(score) {
  if (score >= 80) return "Excellent match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Moderate match";
  if (score >= 20) return "Partial match";
  return "Low match";
}

module.exports = { 
  matchSkills,
  getMatchSummary 
};