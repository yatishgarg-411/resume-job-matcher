const fs = require("fs");
const pdf = require("pdf-parse");

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 * @throws {Error} - If PDF parsing fails
 */
async function extractText(filePath) {
  console.log("[pdfService.js] extractText called");
  console.log("[pdfService.js] File path:", filePath);
  
  // Validate file exists
  if (!fs.existsSync(filePath)) {
    console.error("[pdfService.js] ERROR: File not found:", filePath);
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Check file size
  const stats = fs.statSync(filePath);
  console.log("[pdfService.js] File size:", (stats.size / 1024).toFixed(2), "KB");
  
  if (stats.size === 0) {
    console.error("[pdfService.js] ERROR: File is empty");
    throw new Error("PDF file is empty");
  }
  
  try {
    const dataBuffer = fs.readFileSync(filePath);
    console.log("[pdfService.js] File read into buffer, parsing PDF...");
    
    const data = await pdf(dataBuffer);
    
    // Validate extracted text
    if (!data || !data.text) {
      console.error("[pdfService.js] ERROR: No text extracted from PDF");
      throw new Error("Could not extract text from PDF");
    }
    
    const textLength = data.text.length;
    const numPages = data.numpages || 1;
    
    console.log("[pdfService.js] PDF parsed successfully");
    console.log("[pdfService.js] Pages:", numPages);
    console.log("[pdfService.js] Text length:", textLength, "chars");
    console.log("[pdfService.js] Preview:", data.text.substring(0, 100) + "...");
    
    return data.text;
    
  } catch (error) {
    console.error("[pdfService.js] ERROR parsing PDF:", error.message);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

module.exports = { extractText };