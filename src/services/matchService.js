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

  const score = (matchedSkills / jdSkills.length) * 100;

  return {
    skillsAnalysis,
    matchingScore: Math.round(score)
  };
}

module.exports = { matchSkills };