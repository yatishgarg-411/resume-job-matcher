function matchSkills(resumeSkills, jdSkills){

  const skillsAnalysis = [];

  jdSkills.forEach(skill => {

    const present = resumeSkills.includes(skill);

    skillsAnalysis.push({
      skill: skill,
      presentInResume: present
    });

  });

  const matchedSkills = skillsAnalysis.filter(
    skill => skill.presentInResume
  ).length;

  // Handle division by zero
  const score = jdSkills.length > 0 
    ? (matchedSkills / jdSkills.length) * 100 
    : 0;

  return {
    skillsAnalysis,
    matchingScore: Math.round(score)
  };
}

module.exports = { matchSkills };