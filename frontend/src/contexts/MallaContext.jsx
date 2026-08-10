import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api from '../services/api'

const MallaContext = createContext(null)

const STORAGE_KEY = 'sisplaneceme_malla_seleccionada'

/**
 * Proveedor global de la malla curricular seleccionada.
 *
 * Permite que cualquier usuario (incluidos profesores y lectores) elija desde
 * la barra superior qué malla curricular desea consultar. La selección se
 * persiste en localStorage y queda disponible para todos los módulos mediante
 * el hook `useMalla()`.
 */
export function MallaProvider({ children }) {
  const { isAuthenticated } = useAuth()

  const [mallas, setMallas]                 = useState([])
  const [selectedMallaId, setSelectedMallaIdState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? Number(saved) : null
  })
  const [loading, setLoading] = useState(false)

  const setSelectedMallaId = useCallback((id) => {
    const num = id != null ? Number(id) : null
    setSelectedMallaIdState(num)
    if (num != null) localStorage.setItem(STORAGE_KEY, String(num))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const fetchMallas = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/mallas')
      const list = Array.isArray(data) ? data : []
      setMallas(list)

      // Si no hay selección previa o la guardada ya no existe, elegir la malla
      // activa (o la primera disponible).
      setSelectedMallaIdState((prev) => {
        const sigueValida = prev != null && list.some(m => m.id === prev)
        if (sigueValida) return prev
        const activa = list.find(m => m.estado === 'activo') || list[0]
        const nuevoId = activa ? activa.id : null
        if (nuevoId != null) localStorage.setItem(STORAGE_KEY, String(nuevoId))
        return nuevoId
      })
    } catch {
      // Sin conexión / sin permisos: el selector simplemente no se muestra.
      setMallas([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchMallas()
    else setMallas([])
  }, [isAuthenticated, fetchMallas])

  const selectedMalla = mallas.find(m => m.id === selectedMallaId) || null

  const value = {
    mallas,
    selectedMallaId,
    selectedMalla,
    setSelectedMallaId,
    loading,
    refreshMallas: fetchMallas,
  }

  return <MallaContext.Provider value={value}>{children}</MallaContext.Provider>
}

/**
 * Hook para acceder a la malla curricular seleccionada globalmente.
 */
export function useMalla() {
  const context = useContext(MallaContext)
  if (!context) {
    throw new Error('useMalla debe usarse dentro de un <MallaProvider>.')
  }
  return context
}

export default MallaContext
