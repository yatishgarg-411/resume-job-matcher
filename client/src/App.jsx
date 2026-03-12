import { useState, useRef, useCallback } from 'react'
import './App.css'
import ResultCard from './components/ResultCard'

/* ── JSON view component ── */
function JsonView({ data }) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(data, null, 2)
  const handleCopy = () => {
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="json-view">
      <div className="json-toolbar">
        <span className="json-toolbar-label">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="1" y="1" width="14" height="14" rx="2"/>
            <path d="M4 5l3 3-3 3M9 11h3"/>
          </svg>
          output.json
        </span>
        <button className={`json-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
          {copied ? (
            <>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="2 8 6 12 14 4"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="5" y="5" width="9" height="9" rx="1"/>
                <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2"/>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="json-pre"><code>{json}</code></pre>
    </div>
  )
}

export default function App() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jdFile,     setJdFile]     = useState(null)
  const [jdText,     setJdText]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState(null)
  const [resumeDrag, setResumeDrag] = useState(false)
  const [viewMode,   setViewMode]   = useState('card') // 'card' | 'json'

  const resumeInputRef = useRef(null)
  const jdInputRef     = useRef(null)

  const acceptResume = (file) => {
    if (file && file.type === 'application/pdf') { setResumeFile(file); setError(null) }
    else if (file) setError('Resume must be a PDF file.')
  }
  const acceptJd = (file) => {
    if (file && file.type === 'application/pdf') { setJdFile(file); setError(null) }
    else if (file) setError('JD file must be a PDF.')
  }

  const onResumeDrop = useCallback((e) => {
    e.preventDefault()
    setResumeDrag(false)
    acceptResume(e.dataTransfer.files[0])
  }, [])

  const handleSubmit = async () => {
    if (!resumeFile)                        { setError('Please upload a resume PDF.'); return }
    if (!jdText.trim() && !jdFile)          { setError('Please provide a JD — text or PDF.'); return }

    // ── clear results IMMEDIATELY ──
    setResult(null)
    setError(null)
    setViewMode('card')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)
      formData.append('jdText', jdText.trim())
      if (jdFile) formData.append('jdFile', jdFile)

      const res  = await fetch('/api/match', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok || !data.success) throw new Error(data.message || 'Matching failed. Please try again.')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="13" y2="17"/>
              </svg>
            </div>
            <div>
              <h1 className="brand-name">ResumeMatch</h1>
              <p className="brand-sub">Rule-based Resume &amp; Job Matching Engine</p>
            </div>
          </div>
          <span className="header-badge">No AI APIs &nbsp;·&nbsp; 100% Rule-Based</span>
        </div>
      </header>

      {/* ── PANELS ── */}
      <main className="main">
        <div className="panels">

          {/* ─── PANEL 1: Resume ─── */}
          <section className="panel">
            <div className="panel-head">
              <span className="panel-num">01</span>
              <div>
                <h2 className="panel-title">Upload Resume</h2>
                <p className="panel-desc">Drag &amp; drop or click to browse</p>
              </div>
            </div>

            <div
              className={`drop-zone${
                resumeDrag ? ' drag-over' : ''
              }${resumeFile ? ' has-file' : ''}`}
              onClick={() => resumeInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setResumeDrag(true) }}
              onDragLeave={() => setResumeDrag(false)}
              onDrop={onResumeDrop}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && resumeInputRef.current.click()}
            >
              {resumeFile ? (
                <div className="file-selected">
                  <div className="file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="file-meta">
                    <span className="file-name">{resumeFile.name}</span>
                    <span className="file-size">{(resumeFile.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; PDF</span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={(e) => { e.stopPropagation(); setResumeFile(null) }}
                    title="Remove"
                  >✕</button>
                </div>
              ) : (
                <div className="drop-idle">
                  <div className="drop-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="drop-primary">Drag &amp; drop your resume here</p>
                  <p className="drop-secondary">or click to browse files</p>
                  <span className="drop-badge">PDF Only</span>
                </div>
              )}
            </div>

            <input ref={resumeInputRef} type="file" accept=".pdf" style={{ display:'none' }}
              onChange={(e) => acceptResume(e.target.files[0])} />
          </section>

          {/* ─── PANEL 2: Job Description ─── */}
          <section className="panel">
            <div className="panel-head">
              <span className="panel-num">02</span>
              <div>
                <h2 className="panel-title">Job Description</h2>
                <p className="panel-desc">Upload PDF and/or paste text</p>
              </div>
            </div>

            <div className="jd-upload-box">
              <div className="jd-upload-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="jd-fname">{jdFile ? jdFile.name : 'No JD PDF selected'}</span>
              </div>
              <div className="jd-upload-actions">
                <button className="btn-outline" onClick={() => jdInputRef.current.click()}>
                  {jdFile ? 'Change' : 'Upload PDF'}
                </button>
                {jdFile && <button className="btn-ghost" onClick={() => setJdFile(null)}>Remove</button>}
              </div>
              <input ref={jdInputRef} type="file" accept=".pdf" style={{ display:'none' }}
                onChange={(e) => acceptJd(e.target.files[0])} />
            </div>

            <div className="or-divider">
              <span className="or-line" />
              <span className="or-text">or paste job description</span>
              <span className="or-line" />
            </div>

            <textarea
              className="jd-textarea"
              rows={8}
              placeholder={`Paste the job description here...\n\nExample:\nWe are looking for a Backend Developer with experience in Node.js, Docker and AWS. Minimum 3 years required. Salary: 15 LPA.`}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />

            {error && (
              <div className="error-banner">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <button
              className={`match-btn${loading ? ' match-btn--loading' : ''}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-ring" />Analyzing…</>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Match Resume
                </>
              )}
            </button>
          </section>

          {/* ─── PANEL 3: Results ─── */}
          <section className="panel panel--results">
            <div className="panel-head">
              <span className="panel-num">03</span>
              <div className="panel-head-text">
                <h2 className="panel-title">Match Results</h2>
                <p className="panel-desc">Skills analysis &amp; compatibility score</p>
              </div>
              {result && !loading && (
                <div className="view-toggle-group">
                  <button
                    className={`view-toggle-btn${viewMode === 'card' ? ' vt-active' : ''}`}
                    onClick={() => setViewMode('card')}
                    title="Analytics view"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1" y="1" width="6" height="6" rx="1"/>
                      <rect x="9" y="1" width="6" height="3" rx="1"/>
                      <rect x="9" y="7" width="6" height="8" rx="1"/>
                      <rect x="1" y="10" width="6" height="5" rx="1"/>
                    </svg>
                    Cards
                  </button>
                  <button
                    className={`view-toggle-btn${viewMode === 'json' ? ' vt-active' : ''}`}
                    onClick={() => setViewMode('json')}
                    title="Raw JSON output"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1" y="1" width="14" height="14" rx="2"/>
                      <path d="M4 5l3 3-3 3M9 11h3"/>
                    </svg>
                    JSON
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="results-loading">
                <div className="pulse-rings">
                  <span /><span /><span />
                </div>
                <p className="loading-primary">Analyzing your resume…</p>
                <p className="loading-secondary">Extracting skills · Matching patterns · Scoring</p>
              </div>
            )}

            {!loading && !result && (
              <div className="results-empty">
                <svg viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="36" stroke="#e2e8f0" strokeWidth="3"/>
                  <path d="M24 40h32M24 30h20M24 50h14" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <p className="empty-primary">No results yet</p>
                <p className="empty-secondary">Fill in both panels and click <strong>Match Resume</strong> to see the analysis</p>
              </div>
            )}

            {!loading && result && viewMode === 'card' && <ResultCard result={result} />}
            {!loading && result && viewMode === 'json'  && <JsonView data={result} />}
          </section>

        </div>
      </main>

      <footer className="app-footer">
        <p>ResumeMatch &nbsp;·&nbsp; Rule-based NLP Engine &nbsp;·&nbsp; Built with Node.js &amp; React</p>
      </footer>
    </div>
  )
}
