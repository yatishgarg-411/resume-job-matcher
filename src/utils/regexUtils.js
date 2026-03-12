// Extract years of experience from text
function extractExperience(text) {

  if(!text) return null;

  const regex = /(\d+)\+?\s*(years?|yrs?|yr)/i;

  const match = text.match(regex);

  if(match){
    return parseInt(match[1]);
  }

  return null;
}


// Extract salary from Job Description
function extractSalary(text){

  if(!text) return null;

  const regex = /(₹?\s?\d[\d,]*\s*(LPA|per annum|USD|INR))/i;

  const match = text.match(regex);

  if(match){
    return match[0];
  }

  return null;
}


module.exports = {
  extractExperience,
  extractSalary
};