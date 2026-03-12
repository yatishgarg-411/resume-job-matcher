const skills = require("../utils/skillList");
const { extractSalary, extractExperience } = require("../utils/regexUtils");

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


function parseJD(text){

  if(!text){
    return {
      jdSkills: [],
      salary: null,
      experienceRequired: null
    };
  }

  const jdSkills = extractSkills(text);

  const salary = extractSalary(text);

  const experienceRequired = extractExperience(text);

  return {
    jdSkills,
    salary,
    experienceRequired
  };
}


module.exports = {
  parseJD
};