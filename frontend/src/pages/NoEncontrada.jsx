import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#0A1628' }}
    >
      <h1
        className="font-heading text-8xl font-normal mb-4"
        style={{ color: '#C5A028', opacity: 0.6 }}
      >
        404
      </h1>
      <p className="text-lg mb-8 text-white/45 font-heading">Página no encontrada</p>
      <div className="flex gap-3">
        {isAuthenticated ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded text-sm font-medium transition-all text-white"
            style={{ backgroundColor: '#1E1F24', border: '1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C5A028')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
          >
            Volver al Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded text-sm font-medium transition-all text-white"
            style={{ backgroundColor: '#1E1F24', border: '1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C5A028')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
          >
            Volver al Inicio
          </button>
        )}
      </div>
    </div>
  )
}
