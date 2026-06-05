import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

const API = 'http://localhost:5000'

export default function Home({ onComplete }) {
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState([])
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedIds, setUploadedIds] = useState([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles])
    setError('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  })

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const uploadResumes = async () => {
    if (files.length === 0) {
      setError('Please upload at least one resume!')
      return
    }
    setLoading(true)
    setProgress('Uploading resumes...')
    try {
      const form = new FormData()
      files.forEach(f => form.append('resumes', f))
      const res = await axios.post(`${API}/api/upload/resumes`, form)
      setUploadedIds(res.data.files.map(f => f.id))
      setStep(2)
      setError('')
    } catch (err) {
      setError('Upload failed. Make sure server is running!')
    }
    setLoading(false)
    setProgress('')
  }

  const submitJD = async () => {
    if (!jdText.trim()) {
      setError('Please enter a Job Description!')
      return
    }
    setLoading(true)
    setError('')

    try {
      setProgress('Saving job description...')
      const res = await axios.post(`${API}/api/upload/jd`,
        { text: jdText },
        { headers: { 'Content-Type': 'application/json' } }
      )
      const jdId = res.data.jdId

      setProgress('🤖 AI is analyzing resumes... This may take a minute...')
      await axios.post(`${API}/api/screen/run`, { jdId })

      setProgress('✅ Done! Loading results...')
      onComplete(jdId)
    } catch (err) {
      setError('Analysis failed. Check your API keys and server!')
    }
    setLoading(false)
    setProgress('')
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0a0a0f' }}>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-slow"></span>
            <span className="text-purple-400 text-sm font-medium">AI-Powered Resume Screening</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Resume Ranker
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Upload resumes, paste a job description, and let AI rank your candidates instantly.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                  step >= s
                    ? 'text-white shadow-glow-purple'
                    : 'text-gray-500'
                }`} style={{
                  background: step >= s
                    ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
                    : 'rgba(255,255,255,0.05)',
                  border: step >= s ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }}>
                  {s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? 'text-white' : 'text-gray-500'}`}>
                  {s === 1 ? 'Upload Resumes' : 'Job Description'}
                </span>
              </div>
              {s < 2 && (
                <div className="w-16 h-px" style={{
                  background: step > s
                    ? 'linear-gradient(90deg, #7c3aed, #06b6d4)'
                    : 'rgba(255,255,255,0.1)'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="w-full max-w-2xl animate-slide-up">
          <div className="gradient-border p-8" style={{
            background: 'rgba(18, 18, 26, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(124, 58, 237, 0.3)'
          }}>

            {step === 1 ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Upload Resumes</h2>
                <p className="text-gray-400 text-sm mb-6">Supports PDF, DOC, DOCX — upload multiple at once</p>

                {/* Dropzone */}
                <div {...getRootProps()} className="relative cursor-pointer rounded-2xl p-10 text-center transition-all duration-300"
                  style={{
                    border: `2px dashed ${isDragActive ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                    background: isDragActive ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255,255,255,0.02)',
                  }}>
                  <input {...getInputProps()} />
                  <div className="text-6xl mb-4">📄</div>
                  {isDragActive ? (
                    <p className="text-purple-400 font-semibold text-lg">Drop files here!</p>
                  ) : (
                    <>
                      <p className="text-white font-semibold text-lg mb-1">Drag & drop resumes here</p>
                      <p className="text-gray-500 text-sm">or click to browse files</p>
                    </>
                  )}
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {file.name.endsWith('.pdf') ? '📕' : '📘'}
                          </span>
                          <div>
                            <p className="text-white text-sm font-medium truncate max-w-xs">{file.name}</p>
                            <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(i)}
                          className="text-gray-500 hover:text-red-400 transition-colors text-xl">×</button>
                      </div>
                    ))}
                    <p className="text-purple-400 text-sm text-center pt-1">
                      ✓ {files.length} file{files.length > 1 ? 's' : ''} ready to upload
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 px-4 py-3 rounded-xl text-red-400 text-sm"
                    style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button onClick={uploadResumes} disabled={loading}
                  className="mt-6 w-full py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                  {loading ? `⏳ ${progress}` : `Upload ${files.length > 0 ? files.length : ''} Resume${files.length !== 1 ? 's' : ''} →`}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Job Description</h2>
                <p className="text-gray-400 text-sm mb-6">Paste the full job description for accurate AI matching</p>

                <textarea
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  rows={12}
                  placeholder="Paste the job description here...

Example:
We are looking for a Senior React Developer with 3+ years experience in:
- React.js, TypeScript, Node.js
- REST APIs and GraphQL
- AWS or cloud platforms
..."
                  className="w-full rounded-2xl p-4 text-white text-sm resize-none outline-none transition-all duration-300 focus:border-purple-500"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    lineHeight: '1.6'
                  }}
                />

                <div className="flex items-center justify-between mt-2 mb-4">
                  <span className="text-gray-600 text-xs">{jdText.length} characters</span>
                  {jdText.length > 100 && (
                    <span className="text-green-400 text-xs">✓ Good length</span>
                  )}
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-red-400 text-sm mb-4"
                    style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    ⚠️ {error}
                  </div>
                )}

                {loading && (
                  <div className="px-4 py-4 rounded-xl text-purple-400 text-sm mb-4 text-center"
                    style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                      {progress}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} disabled={loading}
                    className="py-4 px-6 rounded-2xl font-bold text-gray-400 transition-all duration-300 hover:text-white disabled:opacity-50"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    ← Back
                  </button>
                  <button onClick={submitJD} disabled={loading}
                    className="flex-1 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                    {loading ? '⏳ Analyzing...' : '🚀 Analyze & Rank Candidates'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-gray-600 text-sm">
          Powered by <span className="text-purple-400">Gemini AI</span> + <span className="text-cyan-400">Supabase</span>
        </p>
      </div>
    </div>
  )
}