const skills = require("../utils/skillList");
const { extractSalary, extractExperience } = require("../utils/regexUtils");

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
  console.log("[jdParser.js] JD Skills extracted:", foundSkills);
  return [...new Set(foundSkills)];
}


function parseJD(text){
  console.log("[jdParser.js] parseJD called");
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
  console.log("[jdParser.js] Salary extracted:", salary);
  console.log("[jdParser.js] Experience required extracted:", experienceRequired);
  return {
    jdSkills,
    salary,
    experienceRequired
  };
}


module.exports = {
  parseJD
};