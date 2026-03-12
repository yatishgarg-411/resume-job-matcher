const skills = require("../utils/skillList");
const { extractExperience } = require("../utils/regexUtils");

function extractSkills(text){
  if(!text) return [];
  const lowerText = text.toLowerCase();
  const foundSkills = [];
  skills.forEach(skill => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    if(regex.test(lowerText)){
      foundSkills.push(skill);
    }
  });
  console.log("[resumeParser.js] Skills extracted:", foundSkills);
  return [...new Set(foundSkills)];
}


function parseResume(text){
  console.log("[resumeParser.js] parseResume called");
  if(!text){
    return {
      resumeSkills: [],
      experience: null
    };
  }
  const resumeSkills = extractSkills(text);
  const experience = extractExperience(text);
  console.log("[resumeParser.js] Experience extracted:", experience);
  return {
    resumeSkills,
    experience
  };
}


module.exports = {
  parseResume
};