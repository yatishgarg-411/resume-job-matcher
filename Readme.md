# ResumeMatch — Resume & Job Description Matcher

A **rule-based** Resume Parsing and Job Matching System built with **Node.js** and **React**. Upload a resume PDF and a job description (text or PDF), and get an instant skill-match analysis with a compatibility score — all without any LLM or third-party AI APIs.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Output Format](#output-format)
- [Screenshots](#screenshots)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Features

- **PDF Parsing** — Extracts text from resume and JD PDFs using `pdf-parse`
- **Skill Extraction** — 100+ skills recognized via regex + dictionary matching with alias normalization
- **Smart Matching** — Handles skill variations (`ReactJS` → `react`, `AWS` → `aws`, `Python3` → `python`)
- **Dotted Skill Safety** — `next.js`, `node.js`, `vue.js` only match when the literal `.js` exists in text (no false positives from words like "next")
- **Short Skill Context** — Single-letter skills like `R`, `C`, `Go` only match near programming/language context
- **Salary Guard** — Salary extraction skips revenue/EBITDA figures (e.g. "$100 million")
- **Experience Detection** — Recognizes "Graduate Trainee" / "Fresher" as 0 years experience
- **React UI** — 3-panel responsive layout with drag-and-drop resume upload, animated score ring, skill chips
- **Cards / JSON Toggle** — Switch between a structured analytics card view and raw JSON output
- **Copy to Clipboard** — One-click copy of the full JSON response
- **`output.json`** — Written to project root on every successful match

---

## Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Backend   | Node.js, Express 5, Multer       |
| PDF       | pdf-parse v1.1.1                  |
| NLP       | Regex + dictionary (no LLM APIs) |
| Frontend  | React 18, Vite 5                  |
| Styling   | Custom CSS (blue/white theme)     |

---

## Project Structure

```
resume-job-matcher/
├── src/
│   ├── app.js                    # Express server entry point (port 3000)
│   ├── controllers/
│   │   └── matchControllers.js   # Orchestrates the 4-step pipeline
│   ├── routes/
│   │   └── matchRoute.js         # POST /api/match (multer file upload)
│   ├── services/
│   │   ├── pdfService.js         # PDF → text extraction
│   │   ├── resumeParser.js       # Resume → name, email, phone, skills, experience
│   │   ├── jdParser.js           # JD → role, aboutRole, skills, salary, experience
│   │   └── matchService.js       # Skill comparison + score calculation
│   └── utils/
│       ├── skillList.js          # Master list of 150+ recognized skills
│       ├── skillNormalizer.js    # Alias map (200+ variations → canonical forms)
│       └── regexUtils.js         # Experience, salary, name, email, phone extractors
├── client/                       # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx               # Main 3-panel layout + JSON/Cards toggle
│   │   ├── App.css               # Full responsive styling
│   │   ├── components/
│   │   │   └── ResultCard.jsx    # Animated score ring + skill chips
│   │   └── main.jsx              # React entry point
│   ├── vite.config.js            # Dev proxy: /api → localhost:3000
│   └── package.json
├── uploads/                      # Temp directory for uploaded PDFs (gitignored)
├── output.json                   # Last match result (gitignored, auto-generated)
├── package.json                  # Backend dependencies + scripts
├── .gitignore
└── Readme.md
```

---

## Prerequisites

- **Node.js** ≥ 18 — [Download](https://nodejs.org/)
- **npm** ≥ 9 (comes with Node.js)

Verify installation:

```bash
node -v    # Should print v18.x.x or higher
npm -v     # Should print 9.x.x or higher
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yatishgarg/resume-job-matcher.git
cd resume-job-matcher
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 4. Create the uploads directory

```bash
mkdir -p uploads
```

> The `uploads/` folder is used to temporarily store uploaded PDFs during processing. It's gitignored.

---

## Running the App

You need **two terminals** — one for the backend API server and one for the React dev server.

### Terminal 1 — Backend API (port 3000)

```bash
npm start
```

You should see:

```
[app.js] Middleware initialized
Server running on port 3000
```

### Terminal 2 — React UI (port 5173)

```bash
npm run dev:ui
```

Or manually:

```bash
cd client
npm run dev
```

You should see:

```
VITE v5.x.x  ready in 300ms
➜  Local:   http://localhost:5173/
```

### Open the app

Navigate to **http://localhost:5173** in your browser.

---

## API Reference

### `POST /api/match`

Match a resume against a job description.

**Content-Type:** `multipart/form-data`

| Field    | Type   | Required | Description                         |
|----------|--------|----------|-------------------------------------|
| `resume` | File   | Yes      | Resume PDF file                     |
| `jdFile` | File   | No       | Job Description PDF file            |
| `jdText` | String | No       | Job Description as plain text       |

> At least one of `jdFile` or `jdText` must be provided.

**Example using cURL:**

```bash
curl -X POST http://localhost:3000/api/match \
  -F "resume=@/path/to/resume.pdf" \
  -F "jdFile=@/path/to/jd.pdf"
```

**Example using cURL with text JD:**

```bash
curl -X POST http://localhost:3000/api/match \
  -F "resume=@/path/to/resume.pdf" \
  -F "jdText=We are looking for a Python developer with SQL and AWS experience."
```

---

## How It Works

The matching pipeline has **4 steps**:

```
Resume PDF ──┐
             ├──▶ [1] PDF Text Extraction (pdf-parse)
JD PDF/Text ─┘
                    │
                    ▼
             [2] Resume Parsing
             • Name, Email, Phone (regex)
             • Skills (dictionary + alias matching)
             • Experience (regex)
                    │
                    ▼
             [3] JD Parsing
             • Role (label detection + known titles)
             • Skills (same dictionary engine)
             • Salary (context-aware regex)
             • Experience (regex + fresher detection)
                    │
                    ▼
             [4] Skill Matching
             • Normalize both skill sets
             • Compare and calculate match %
             • Generate skill-by-skill analysis
                    │
                    ▼
             JSON Response + output.json
```

### Skill Extraction Rules

| Category | Handling |
|----------|----------|
| **Standard skills** (3+ chars) | `\b` word boundary regex on preprocessed text |
| **Dotted skills** (`next.js`, `node.js`) | Literal substring match — dot must exist in text |
| **Short skills** (`R`, `C`, `Go`) | Context-aware: only match near "language", "programming", or listed alongside other languages |
| **Alias resolution** | 200+ aliases → canonical forms (`ReactJS` → `react`, `k8s` → `kubernetes`) |

---

## Output Format

```json
{
  "success": true,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "yearOfExperience": 2,
  "resumeSkills": ["python", "sql", "react", "aws", "git"],
  "matchingJobs": [
    {
      "jobId": "JD001",
      "role": "Data Analyst",
      "aboutRole": "You will analyze large datasets...",
      "salary": null,
      "experienceRequired": 0,
      "skillsAnalysis": [
        { "skill": "python", "presentInResume": true },
        { "skill": "sql", "presentInResume": true },
        { "skill": "tableau", "presentInResume": false },
        { "skill": "excel", "presentInResume": false }
      ],
      "matchingScore": 50,
      "matchSummary": "Moderate match",
      "matchedSkillsCount": 2,
      "totalRequiredSkills": 4
    }
  ]
}
```

### Match Score Labels

| Score Range | Label |
|-------------|-------|
| 80–100%     | Excellent match |
| 60–79%      | Good match |
| 40–59%      | Moderate match |
| 20–39%      | Partial match |
| 0–19%       | Low match |

---

## Environment Variables

This project does **not** require any environment variables or `.env` file to run. Everything works out of the box.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3000`  | Backend server port (hardcoded in `src/app.js`) |

If you need to change the port, edit the `PORT` constant in [src/app.js](src/app.js) and update the proxy target in [client/vite.config.js](client/vite.config.js).

---

## Troubleshooting

### Server starts then immediately exits

**Cause:** Port 3000 is already in use from a previous run.

```bash
# Kill whatever is on port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
npm start
```

### `Cannot find module 'pdf-parse'`

```bash
npm install
```

### Frontend shows "Network Error" or blank page

Make sure **both** servers are running:
- Backend on port 3000 (`npm start`)
- Frontend on port 5173 (`npm run dev:ui`)

The Vite dev server proxies `/api` calls to `localhost:3000`. If the backend isn't running, API calls will fail.

### `uploads/` directory missing

```bash
mkdir -p uploads
```

### PDF text extraction returns empty

Some PDFs are image-based (scanned documents). `pdf-parse` can only extract text from text-based PDFs. If your resume is a scanned image, convert it to a text-based PDF first.

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm start` | Start the backend API server |
| `npm run dev:api` | Same as `npm start` (alias) |
| `npm run dev:ui` | Start the React dev server (Vite) |

---

## License

ISC

---

Built with Node.js & React — no LLM APIs, pure rule-based NLP.
