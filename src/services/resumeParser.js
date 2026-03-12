const skills = require("../utils/skillList");
const { extractExperience } = require("../utils/regexUtils");

function extractSkills(text){

  if(!text) return [];

  const lowerText = text.toLowerCase();

  const foundSkills = [];

  skills.forEach(skill => {
    // Use word boundary regex to avoid false positives
    // e.g., "c" should not match "react", "go" should not match "google"
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    if(regex.test(lowerText)){
      foundSkills.push(skill);
    }
  });

  return [...new Set(foundSkills)];
}


function parseResume(text){

  if(!text){
    return {
      resumeSkills: [],
      experience: null
    };
  }

  const resumeSkills = extractSkills(text);

  const experience = extractExperience(text);

  return {
    resumeSkills,
    experience
  };
}


module.exports = {
  parseResume
};