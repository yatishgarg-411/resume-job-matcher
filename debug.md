Resume Parsing and Job Matching System — Debug Specification
Project Overview

This project implements a rule-based Resume Parsing and Job Matching System using Node.js.

The system:

Accepts a resume (PDF upload)

Accepts a Job Description (JD) as text or PDF

Extracts structured data from both documents

Performs skill comparison

Calculates a matching score

Returns structured JSON output

The assignment explicitly requires a rule-based solution without using LLM APIs or generative AI services. 

5dd3025a-3f5c-4225-8874-8f3273c…

Allowed techniques include:

Regex

Rule-based NLP

Statistical NLP

PDF parsing libraries

Tech Stack

Node.js

Express.js

Multer (file upload)

pdf-parse (PDF text extraction)

Regex-based extraction

Dictionary-based skill matching

Project Architecture
src
 ├── controllers
 │    └── matchController.js
 │
 ├── routes
 │    └── matchRoute.js
 │
 ├── services
 │    ├── pdfService.js
 │    ├── resumeParser.js
 │    ├── jdParser.js
 │    └── matchService.js
 │
 ├── utils
 │    ├── regexUtils.js
 │    └── skillList.js
 │
 └── app.js

uploads/
System Flow
Client Request
POST /api/match
      │
      ▼
Upload resume.pdf + jdText
      │
      ▼
pdfService
      │
      ▼
Extract resume text
      │
      ▼
resumeParser
      │
      ▼
resumeSkills + experience
      │
      ▼
jdParser
      │
      ▼
jdSkills + salary + requiredExperience
      │
      ▼
matchService
      │
      ▼
skillsAnalysis + matchingScore
      │
      ▼
JSON Response
Skill Extraction Logic

Skills are extracted using a dictionary-based matching approach.

Example dictionary (skillList.js):

node.js
react
docker
mongodb
aws
python
java
kubernetes
mysql
postgresql

Extraction method:

text.toLowerCase().includes(skill)
Experience Extraction

Regex example used:

(\d+)\+?\s*(years?|yrs?|yr)

Matches examples like:

5 years
3+ yrs
2 yr experience

Expected output:

5
3
2
Salary Extraction

Regex example:

₹?\d[\d,]*\s*(LPA|per annum|USD|INR)

Matches examples like:

12 LPA
₹10,00,000 per annum
50000 USD
Skill Matching Logic

Matching score formula:

matchingScore = (matchedSkills / totalJDSkills) * 100

Example:

Resume Skills:

node.js
mongodb
react

JD Skills:

node.js
docker
aws

Skill Analysis:

node.js → true
docker → false
aws → false

Score:

1 / 3 = 33%
Expected JSON Output Format

The final output should match the required format.

Example:

{
  "name": "John Doe",
  "salary": "12 LPA",
  "yearOfExperience": 4.5,
  "resumeSkills": ["Java", "Spring Boot"],
  "matchingJobs": [
    {
      "jobId": "JD001",
      "role": "Backend Developer",
      "aboutRole": "Responsible for backend development.",
      "skillsAnalysis": [
        { "skill": "Java", "presentInResume": true },
        { "skill": "Kafka", "presentInResume": false }
      ],
      "matchingScore": 50
    }
  ]
}
Current MVP Limitations

The current implementation may have the following limitations.

1. Skill Normalization Missing

Examples that should match:

NodeJS
Node.js
node js

All should normalize to:

node.js
2. Resume Name Extraction Missing

The system should attempt to extract the candidate name from the resume header.

3. Experience Regex Coverage Limited

Current regex detects:

5 years

But should also detect:

5+ yrs
over 3 years
minimum 2 years
4. JD Skill Extraction Improvements

Should ideally support:

Required skills

Optional skills

5. Matching Output

Each JD skill must return:

{ "skill": "Java", "presentInResume": true }
6. Score Validation

Score must always stay within:

0 – 100
Debug Tasks for Copilot

Analyze the repository and improve the implementation while keeping the rule-based approach.

Tasks:

1. Improve Extraction Accuracy

Ensure the system correctly extracts:

skills

experience

salary

2. Implement Skill Normalization

Map variations such as:

nodejs
node js
node.js

to

node.js
3. Improve Text Processing

Before skill matching apply:

lowercase conversion

punctuation removal

tokenization

4. Ensure Correct JSON Output

Return response exactly in the expected structure.

5. Improve Error Handling

Handle cases such as:

resume not uploaded

empty JD text

PDF parsing failure

6. Validate Matching Score Logic

Ensure correct formula:

matchingScore = (matchedSkills / totalJDSkills) * 100
7. Maintain Modular Architecture

Ensure responsibilities are separated:

controllers → request handling
services → parsing + matching logic
utils → regex + skills dictionary
8. Ensure Project Runs Easily

Project should run with:

npm install
node src/app.js
Final Goal

Ensure the system:

✔ Extracts resume skills
✔ Extracts JD skills
✔ Extracts experience
✔ Extracts salary
✔ Matches skills
✔ Calculates matching score
✔ Returns structured JSON output
✔ Follows rule-based NLP approach

No LLM APIs or AI services should be used.