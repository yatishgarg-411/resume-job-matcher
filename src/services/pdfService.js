const fs = require("fs");
const pdf = require("pdf-parse");

async function extractText(filePath){
	console.log("[pdfService.js] extractText called with filePath:", filePath);
	const dataBuffer = fs.readFileSync(filePath);
	const data = await pdf(dataBuffer);
	console.log("[pdfService.js] PDF text extracted");
	return data.text;
}

module.exports = {extractText};