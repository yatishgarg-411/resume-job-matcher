function matchSkills(resumeSkills, jdSkills){
  console.log("[matchService.js] matchSkills called");
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
  console.log("[matchService.js] Skills analysis:", skillsAnalysis);
  console.log("[matchService.js] Matching score:", Math.round(score));
  return {
    skillsAnalysis,
    matchingScore: Math.round(score)
  };
}

module.exports = { matchSkills };