const skills = require("../utils/skillList");
const { extractSalary, extractExperience } = require("../utils/regexUtils");

function extractSkills(text){

  if(!text) return [];

  const lowerText = text.toLowerCase();

  const foundSkills = [];

  skills.forEach(skill => {

    if(lowerText.includes(skill)){
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