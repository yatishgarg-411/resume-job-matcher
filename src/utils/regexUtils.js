/**
 * Regex Utilities — rule-based extraction of structured fields
 */

/**
 * Extract years of experience from text.
 * Recognises fresher / graduate trainee roles as 0 years.
 */
function extractExperience(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Fresher / graduate / entry-level → return 0
  if (/\b(fresher|entry[\s\-]?level|graduate\s*trainee|trainee|intern|0[\s\-]?1\s*years?|no\s+experience)\b/i.test(lower)) {
    return 0;
  }

  // Range: "3-5 years" → lower bound
  const rangeMatch = lower.match(/(\d+(?:\.\d+)?)\s*[-–to]+\s*\d+(?:\.\d+)?\s*(?:years?|yrs?)/i);
  if (rangeMatch) return parseFloat(rangeMatch[1]);

  // Qualified: "over/minimum/at least X years"
  const qualifiedMatch = lower.match(/(?:over|minimum|at\s+least|more\s+than|upto|up\s+to)\s+(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  if (qualifiedMatch) return parseFloat(qualifiedMatch[1]);

  // Standard: "X years", "X+ years", "X yrs of experience"
  const standardMatch = lower.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?/i);
  if (standardMatch) return parseFloat(standardMatch[1]);

  return null;
}

/**
 * Extract salary ONLY when near salary-related keywords.
 * Strictly avoids revenue / profit figures like "$100 million EBITDA".
 */
function extractSalary(text) {
  if (!text) return null;

  const lines = text.split("\n");

  for (const line of lines) {
    // SKIP lines that mention company financials
    if (/\b(ebidta|ebitda|revenue|profit|funding|valuation|million|billion|market\s*cap|growth|turnover)\b/i.test(line)) {
      continue;
    }

    const lower = line.toLowerCase();

    // Only consider lines with salary-related keywords
    if (!/\b(salary|ctc|compensation|package|stipend|pay|remuneration|per\s*annum|cost\s*to\s*company)\b/i.test(lower)) {
      continue;
    }

    // LPA format: "12 LPA", "10-15 LPA"
    const lpaMatch = line.match(/(?:₹|rs\.?)?\s*(\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?)\s*lpa/i);
    if (lpaMatch) return lpaMatch[0].trim();

    // Currency format: "$50,000", "₹10,00,000"
    const currencyMatch = line.match(/((?:₹|rs\.?|inr|usd|\$|€|£)\s*[\d,]+(?:\.\d+)?(?:\s*[-–]\s*(?:₹|rs\.?|inr|usd|\$|€|£)?\s*[\d,]+(?:\.\d+)?)?)/i);
    if (currencyMatch) return currencyMatch[1].trim();
  }

  // Standalone LPA anywhere (common in Indian JDs)
  const lpaFallback = text.match(/(?:₹|rs\.?)?\s*(\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?)\s*lpa/i);
  if (lpaFallback) return lpaFallback[0].trim();

  return null;
}

/**
 * Extract candidate name from resume text.
 */
function extractName(text) {
  if (!text) return null;

  // Explicit label: "Name: John Doe"
  const labelMatch = text.match(/(?:^|\n)\s*(?:name|candidate)\s*[:\s]+([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+){1,3})/i);
  if (labelMatch) return labelMatch[1].trim();

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    if (/@|phone|mobile|\+\d|\(\d{3}\)/.test(line)) continue;
    if (/https?:\/\/|www\.|linkedin|github/i.test(line)) continue;
    if (/^(resume|curriculum|cv|profile|summary|objective|contact|email|address)/i.test(line)) continue;

    const nameMatch = line.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})$/);
    if (nameMatch) return nameMatch[1];

    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 &&
        words.every(w => /^[A-Z]/.test(w)) &&
        !/[,;@]/.test(line)) {
      return line;
    }
  }

  return null;
}

/**
 * Extract email address
 */
function extractEmail(text) {
  if (!text) return null;
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

/**
 * Extract phone number
 */
function extractPhone(text) {
  if (!text) return null;
  const patterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\+?\d{10,12}/
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

module.exports = {
  extractExperience,
  extractSalary,
  extractName,
  extractEmail,
  extractPhone,
};
