/* eslint-disable react/prop-types */

/**
 * Animated SVG score ring
 */
function ScoreRing({ score }) {
  const R    = 52
  const circ = 2 * Math.PI * R
  const offset = circ - (score / 100) * circ

  const color =
    score >= 70 ? '#16a34a' :
    score >= 40 ? '#d97706' : '#dc2626'

  const label =
    score >= 70 ? 'Excellent Match' :
    score >= 40 ? 'Good Match'      :
    score >= 20 ? 'Partial Match'   : 'Low Match'

  return (
    <div className="score-ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130" aria-label={`Match score ${score}%`}>
        {/* Track */}
        <circle cx="65" cy="65" r={R} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="65" cy="65" r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)' }}
        />
        {/* Score text */}
        <text x="65" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill={color} fontFamily="inherit">
          {score}%
        </text>
        <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="inherit">
          SCORE
        </text>
      </svg>
      <span className="score-label" style={{ color }}>{label}</span>
    </div>
  )
}

/**
 * Main result card component
 */
export default function ResultCard({ result }) {
  const job = result?.matchingJobs?.[0]
  if (!job) return null

  const matched = job.skillsAnalysis?.filter(s =>  s.presentInResume) || []
  const missing = job.skillsAnalysis?.filter(s => !s.presentInResume) || []

  return (
    <div className="result-card">

      {/* Score ring */}
      <ScoreRing score={job.matchingScore ?? 0} />

      {/* Candidate + JD info grid */}
      <div className="info-grid">
        <div className="info-card">
          <span className="info-label">Candidate</span>
          <span className="info-value">{result.name || '—'}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Experience</span>
          <span className="info-value">
            {result.yearOfExperience != null ? `${result.yearOfExperience} yrs` : '—'}
          </span>
        </div>
        <div className="info-card">
          <span className="info-label">Role Applied</span>
          <span className="info-value">{job.role || '—'}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Salary</span>
          <span className="info-value">{job.salary || '—'}</span>
        </div>
      </div>

      {/* Email */}
      {result.email && (
        <div className="email-row">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V16a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
          {result.email}
        </div>
      )}

      {/* Skills breakdown */}
      <div className="skills-section">
        <div className="skills-header">
          <span className="skills-title">Skills Analysis</span>
          <span className="skills-count-badge">
            {matched.length}&nbsp;/&nbsp;{job.skillsAnalysis?.length || 0} matched
          </span>
        </div>

        {matched.length > 0 && (
          <div className="skill-group">
            <span className="skill-group-label matched">✓ Matched Skills</span>
            <div className="chips">
              {matched.map(s => (
                <span key={s.skill} className="chip chip-matched">{s.skill}</span>
              ))}
            </div>
          </div>
        )}

        {missing.length > 0 && (
          <div className="skill-group">
            <span className="skill-group-label missing">✗ Missing Skills</span>
            <div className="chips">
              {missing.map(s => (
                <span key={s.skill} className="chip chip-missing">{s.skill}</span>
              ))}
            </div>
          </div>
        )}

        {result.resumeSkills?.length > 0 && (
          <div className="skill-group">
            <span className="skill-group-label all">📋 All Resume Skills</span>
            <div className="chips">
              {result.resumeSkills.map(s => (
                <span key={s} className="chip chip-resume">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Match summary */}
      {job.matchSummary && (
        <div className="match-summary-row">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          {job.matchSummary}
          {job.experienceRequired && (
            <span className="exp-req">&nbsp;· Requires {job.experienceRequired} yrs exp</span>
          )}
        </div>
      )}
    </div>
  )
}
