import { useState } from 'react'
import Home from './pages/Home'
import Results from './pages/Results'

export default function App() {
  const [page, setPage] = useState('home')
  const [jdId, setJdId] = useState(null)

  const handleComplete = (id) => {
    setJdId(id)
    setPage('results')
  }

  return (
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      {page === 'home'
        ? <Home onComplete={handleComplete} />
        : <Results jdId={jdId} onBack={() => setPage('home')} />
      }
    </div>
  )
}