const { extractText } = require("../services/pdfService");
const { parseResume } = require("../services/resumeParser");
const { parseJD } = require("../services/jdParser");
const { matchSkills } = require("../services/matchService");

async function matchResume(req,res){

  try{

    const resumeFile = req.file;

    const jdText = req.body.jdText;

    if(!resumeFile){
      return res.status(400).json({
        error:"Resume file required"
      });
    }

    const resumeText = await extractText(resumeFile.path);

    const resumeData = parseResume(resumeText);

    const jdData = parseJD(jdText);

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

    res.json(output);

  }
  catch(error){

    console.error(error);

    res.status(500).json({
      error:"Server error"
    });

  }
}

module.exports = { matchResume };