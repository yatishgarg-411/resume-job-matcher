/**
 * Regex Utilities for extracting structured data from text
 */

/**
 * Extract years of experience from text
 * Handles various formats:
 * - "5 years", "5+ years", "5+ yrs"
 * - "over 3 years", "minimum 2 years"
 * - "3-5 years" (returns the lower bound)
 * - "4.5 years" (decimal years)
 * @param {string} text - Input text
 * @returns {number|null} - Years of experience or null
 */
function extractExperience(text) {
  if (!text) return null;

  const patterns = [
    // "5+ years", "5 years", "5 yrs", "5 yr"
    /(\d+\.?\d*)\+?\s*(years?|yrs?|yr)\s*(of\s+experience)?/i,
    // "over 3 years", "minimum 2 years", "at least 4 years"
    /(over|minimum|at\s+least|min\.?)\s*(\d+\.?\d*)\s*(years?|yrs?|yr)/i,
    // "3-5 years" (range - return lower bound)
    /(\d+\.?\d*)\s*[-–to]+\s*\d+\.?\d*\s*(years?|yrs?|yr)/i,
    // "experience: 5 years"
    /experience\s*[:=]?\s*(\d+\.?\d*)\s*(years?|yrs?|yr)?/i
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match) {
      // Handle "over/minimum X years" pattern - number is in group 2
      if (match[0].toLowerCase().match(/^(over|minimum|at\s+least|min)/)) {
        return parseFloat(match[2]);
      }
      // For other patterns, number is in group 1
      return parseFloat(match[1]);
    }
  }

  return null;
}

/**
 * Extract salary from text
 * Handles various formats:
 * - "12 LPA", "₹12 LPA"
 * - "₹10,00,000 per annum"
 * - "50000 USD", "$50,000"
 * - "10-15 LPA" (returns the range)
 * @param {string} text - Input text
 * @returns {string|null} - Salary string or null
 */
function extractSalary(text) {
  if (!text) return null;

  const patterns = [
    // "12 LPA", "₹12 LPA", "12LPA"
    /(₹?\s*\d+\.?\d*\s*[-–to]*\s*\d*\.?\d*\s*(?:LPA|lpa|lakhs?\s*per\s*annum))/i,
    // "₹10,00,000 per annum", "₹1000000 per annum"
    /(₹\s*[\d,]+\s*(?:per\s*annum|p\.?a\.?|annually))/i,
    // "$50,000", "USD 50000", "50000 USD"
    /(\$\s*[\d,]+|\d[\d,]*\s*(?:USD|usd)(?:\s*per\s*(?:year|annum))?)/i,
    // "50000 INR", "INR 50000"
    /((?:INR|inr)\s*[\d,]+|[\d,]+\s*(?:INR|inr))/i,
    // Generic salary pattern with currency
    /(salary\s*[:=]?\s*₹?\$?\s*[\d,]+\s*(?:LPA|USD|INR|per\s*annum)?)/i
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract candidate name from resume text
 * Typically the name appears at the top of the resume
 * @param {string} text - Resume text
 * @returns {string|null} - Candidate name or null
 */
function extractName(text) {
  if (!text) return null;

  // Get first few lines where name usually appears
  const lines = text.split('\n').slice(0, 10);
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Skip lines that look like headers/labels
    if (/^(resume|curriculum\s*vitae|cv|profile|summary|objective|contact|email|phone|address)/i.test(trimmed)) {
      continue;
    }
    
    // Skip lines with email or phone
    if (/@|phone|mobile|\+\d|\(\d{3}\)/.test(trimmed)) {
      continue;
    }
    
    // Skip lines with URLs
    if (/https?:\/\/|www\.|linkedin|github/i.test(trimmed)) {
      continue;
    }
    
    // Name pattern: 2-4 words, each starting with capital letter
    // Allow for middle names and suffixes
    const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/;
    const match = trimmed.match(namePattern);
    
    if (match) {
      return match[1];
    }
    
    // Also try: first line that's just 2-4 capitalized words
    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const allCapitalized = words.every(word => /^[A-Z][a-z]*$/.test(word));
      if (allCapitalized) {
        return trimmed;
      }
    }
  }

  return null;
}

/**
 * Extract email from text
 * @param {string} text - Input text
 * @returns {string|null} - Email or null
 */
function extractEmail(text) {
  if (!text) return null;
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0].toLowerCase() : null;
}

/**
 * Extract phone number from text
 * @param {string} text - Input text
 * @returns {string|null} - Phone number or null
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
  extractPhone
};