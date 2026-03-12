const { extractText } = require("../services/pdfService");
const { parseResume } = require("../services/resumeParser");
const { parseJD } = require("../services/jdParser");
const { matchSkills } = require("../services/matchService");

async function matchResume(req,res){

  try{
    console.log("[matchControllers.js] matchResume called");
    const resumeFile = req.file;
    const jdText = req.body.jdText;
    if(!resumeFile){
      console.log("[matchControllers.js] No resume file uploaded");
      return res.status(400).json({
        error:"Resume file required"
      });
    }
    console.log("[matchControllers.js] Extracting text from resume PDF");
    const resumeText = await extractText(resumeFile.path);
    console.log("[matchControllers.js] Parsing resume");
    const resumeData = parseResume(resumeText);
    console.log("[matchControllers.js] Parsing job description");
    const jdData = parseJD(jdText);
    console.log("[matchControllers.js] Matching skills");
    const matchResult = matchSkills(
      resumeData.resumeSkills,
      jdData.jdSkills
    );
    const output = {
      resumeSkills: resumeData.resumeSkills,
      jdSkills: jdData.jdSkills,
      skillsAnalysis: matchResult.skillsAnalysis,
      matchingScore: matchResult.matchingScore
    };
    console.log("[matchControllers.js] Sending response", output);
    res.json(output);
  }
  catch(error){
    console.error("[matchControllers.js] Error:", error);
    res.status(500).json({
      error:"Server error"
    });
  }
}

module.exports = { matchResume };