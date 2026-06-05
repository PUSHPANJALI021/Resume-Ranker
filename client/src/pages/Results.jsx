import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000'

export default function Results({ onBack }) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/screen/results`)
      .then(r => { setCandidates(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = candidates.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const avgScore = candidates.length
    ? Math.round(candidates.reduce((a, c) => a + c.score, 0) / candidates.length)
    : 0

  const stats = [
    { label: 'Total Candidates', value: candidates.length, color: '#a78bfa' },
    { label: 'Strong Match', value: candidates.filter(c => c.score >= 75).length, color: '#10b981' },
    { label: 'Avg Score', value: avgScore, color: '#06b6d4' },
  ]

  const exportCSV = () => {
    const headers = 'Rank,Name,Email,Score,Matched Skills,Missing Skills,Summary\n'
    const rows = candidates.map(c =>
      `${c.rank},"${c.name}","${c.email || ''}",${c.score},"${c.matched_skills?.join('; ')}","${c.missing_skills?.join('; ')}","${c.summary}"`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'candidate_rankings.csv'; a.click()
  }

  const getScoreColor = (score) => {
    if (score >= 75) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', label: 'Strong' }
    if (score >= 50) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', label: 'Moderate' }
    return { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.3)', label: 'Weak' }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-purple-400 text-lg font-semibold">Loading results...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <button onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3 text-sm">
              ← New Screening
            </button>
            <h1 className="text-4xl font-black" style={{
              background: 'linear-gradient(135deg, #ffffff, #a78bfa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Candidate Rankings
            </h1>
            <p className="text-gray-400 mt-1">{candidates.length} candidates analyzed and ranked by AI</p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
            📊 Export CSV
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(18,18,26,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates by name or email..."
            className="w-full pl-10 pr-4 py-4 rounded-2xl text-white outline-none transition-all"
            style={{
              background: 'rgba(18,18,26,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

        {/* Candidate Cards */}
        <div className="space-y-4">
          {filtered.map((c) => {
            const scoreStyle = getScoreColor(c.score)
            const isSelected = selected === c.id

            return (
              <div key={c.id}
                className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:scale-[1.01]"
                style={{
                  background: 'rgba(18,18,26,0.9)',
                  border: `1px solid ${isSelected ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isSelected ? '0 0 30px rgba(124, 58, 237, 0.2)' : 'none'
                }}
                onClick={() => setSelected(isSelected ? null : c.id)}>

                {/* Main Row */}
                <div className="flex items-center gap-4 p-5">

                  {/* Rank */}
                  <div className="text-2xl font-black min-w-[50px] text-center">
                    {getRankBadge(c.rank)}
                  </div>

                  {/* Score Circle */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none"
                        stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="32" cy="32" r="28" fill="none"
                        stroke={scoreStyle.color} strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - c.score / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black text-white">{c.score}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-lg truncate">{c.name || 'Unknown'}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ background: scoreStyle.bg, color: scoreStyle.color, border: `1px solid ${scoreStyle.border}` }}>
                        {scoreStyle.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm truncate">{c.email || 'No email found'}</p>
                    <p className="text-gray-400 text-xs mt-1 truncate">{c.file_name}</p>
                  </div>

                  {/* Score Bar */}
                  <div className="hidden md:block w-32">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Match</span>
                      <span>{c.score}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${c.score}%`,
                          background: `linear-gradient(90deg, ${scoreStyle.color}, #7c3aed)`
                        }} />
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="text-gray-500 transition-transform duration-300"
                    style={{ transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </div>
                </div>

                {/* Expanded Details */}
                {isSelected && (
                  <div className="px-5 pb-5 border-t animate-fade-in"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="pt-4 grid md:grid-cols-3 gap-4">

                      {/* Summary */}
                      <div className="md:col-span-3 p-4 rounded-xl"
                        style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                        <p className="text-purple-400 text-xs font-semibold mb-1 uppercase tracking-wider">AI Summary</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{c.summary}</p>
                      </div>

                      {/* Matched Skills */}
                      <div className="p-4 rounded-xl"
                        style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                        <p className="text-green-400 text-xs font-semibold mb-3 uppercase tracking-wider">✓ Matched Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {c.matched_skills?.map((s, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-xs font-medium"
                              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="p-4 rounded-xl"
                        style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                        <p className="text-red-400 text-xs font-semibold mb-3 uppercase tracking-wider">✗ Missing Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {c.missing_skills?.map((s, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-xs font-medium"
                              style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="p-4 rounded-xl"
                        style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                        <p className="text-cyan-400 text-xs font-semibold mb-3 uppercase tracking-wider">Score Breakdown</p>
                        {[
                          { label: 'Skills Match', pct: 40 },
                          { label: 'Experience', pct: 30 },
                          { label: 'Education', pct: 20 },
                          { label: 'Keywords', pct: 10 },
                        ].map((item, i) => (
                          <div key={i} className="mb-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{item.label}</span>
                              <span>{item.pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full"
                              style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <div className="h-full rounded-full"
                                style={{
                                  width: `${item.pct}%`,
                                  background: 'linear-gradient(90deg, #06b6d4, #7c3aed)'
                                }} />
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">No candidates found</p>
          </div>
        )}

      </div>
    </div>
  )
}