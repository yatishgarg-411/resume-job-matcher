const fs = require("fs");
const path = require("path");
const { extractText } = require("../services/pdfService");
const { parseResume } = require("../services/resumeParser");
const { parseJD } = require("../services/jdParser");
const { matchSkills, getMatchSummary } = require("../services/matchService");

/**
 * Main controller for resume matching
 * Handles file upload, parsing, and matching
 */
async function matchResume(req, res) {
  console.log("\n========================================");
  console.log("[matchControllers.js] matchResume called");
  console.log("========================================");
  
  try {
    const resumeFile  = req.files?.resume?.[0];
    const jdFileUpload = req.files?.jdFile?.[0];
    let   jdText = req.body.jdText || "";
    
    // Validation: Check if resume file is uploaded
    if (!resumeFile) {
      console.log("[matchControllers.js] ERROR: No resume file uploaded");
      return res.status(400).json({
        success: false,
        error: "Resume file required",
        message: "Please upload a PDF resume file"
      });
    }
    
    // Validation: JD must come from at least one source
    if ((!jdText || jdText.trim() === "") && !jdFileUpload) {
      console.log("[matchControllers.js] ERROR: No JD provided");
      return res.status(400).json({
        success: false,
        error: "Job description required",
        message: "Please provide a job description (text or PDF)"
      });
    }
    
    console.log("[matchControllers.js] Resume file:", resumeFile.originalname);
    if (jdFileUpload) console.log("[matchControllers.js] JD file:", jdFileUpload.originalname);
    if (jdText)        console.log("[matchControllers.js] JD text length:", jdText.length, "chars");
    
    // Step 1: Extract text from resume PDF
    console.log("\n[STEP 1] Extracting text from resume PDF...");
    let resumeText;
    try {
      resumeText = await extractText(resumeFile.path);
      if (!resumeText || resumeText.trim() === "") throw new Error("Empty content");
    } catch (pdfError) {
      console.error("[matchControllers.js] Resume PDF error:", pdfError.message);
      return res.status(400).json({
        success: false,
        error: "PDF parsing failed",
        message: "Could not extract text from the resume PDF."
      });
    }

    // Step 1b: Extract text from JD PDF (if provided)
    if (jdFileUpload && !jdText.trim()) {
      console.log("[STEP 1b] Extracting text from JD PDF...");
      try {
        jdText = await extractText(jdFileUpload.path);
      } catch (jdErr) {
        console.error("[matchControllers.js] JD PDF error:", jdErr.message);
        return res.status(400).json({
          success: false,
          error: "JD PDF parsing failed",
          message: "Could not extract text from the JD PDF."
        });
      }
    }
    
    // Step 2: Parse resume
    console.log("\n[STEP 2] Parsing resume...");
    const resumeData = parseResume(resumeText);
    
    // Step 3: Parse job description
    console.log("\n[STEP 3] Parsing job description...");
    const jdData = parseJD(jdText);
    
    // Step 4: Match skills
    console.log("\n[STEP 4] Matching skills...");
    const matchResult = matchSkills(
      resumeData.resumeSkills,
      jdData.jdSkills
    );
    
    // Build output in the expected format from debug.md
    const output = {
      success: true,
      name: resumeData.name || "Unknown Candidate",
      email: resumeData.email,
      phone: resumeData.phone,
      yearOfExperience: resumeData.experience,
      resumeSkills: resumeData.resumeSkills,
      matchingJobs: [
        {
          jobId: "JD001",
          role: jdData.role || "Job Position",
          aboutRole: jdData.aboutRole,
          salary: jdData.salary,
          experienceRequired: jdData.experienceRequired,
          skillsAnalysis: matchResult.skillsAnalysis,
          matchingScore: matchResult.matchingScore,
          matchSummary: getMatchSummary(matchResult.matchingScore),
          matchedSkillsCount: matchResult.matchedCount,
          totalRequiredSkills: matchResult.totalRequired
        }
      ]
    };
    
    console.log("\n========================================");
    console.log("[matchControllers.js] SUCCESS - Sending response");
    console.log("[matchControllers.js] Match Score:", matchResult.matchingScore + "%");
    console.log("========================================\n");
    
    // Write output to output.json at project root
    const outputPath = path.join(__dirname, "../../output.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
    console.log("[matchControllers.js] Output written to output.json");
    
    res.json(output);
    
  } catch (error) {
    console.error("\n========================================");
    console.error("[matchControllers.js] UNEXPECTED ERROR:", error);
    console.error("========================================\n");
    
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "An unexpected error occurred while processing your request"
    });
  }
}

module.exports = { matchResume };