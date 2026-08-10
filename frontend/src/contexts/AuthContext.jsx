import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import api from '../services/api'

const AuthContext = createContext(null)

/**
 * Proveedor de autenticación global.
 * Envuelve la aplicación y provee:
 *   - user: datos del usuario autenticado (id, email, ci, nombre, grado, roles, permisos)
 *   - loading: true mientras se verifica la sesión
 *   - refreshUser: función para recargar datos del usuario
 *   - logout: cerrar sesión
 *   - hasRole: verifica si el usuario tiene un rol específico
 *   - hasPermission: verifica si el usuario tiene un permiso específico
 *   - isAuthenticated: true si hay sesión activa
 */
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)

  // Cargar datos del usuario desde el backend
  const fetchUserData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }

      // Obtener datos completos del backend (id, email, ci, nombre, grado, roles, permisos)
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Verificar sesión al montar el componente
  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Escuchar cambios en la sesión de Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserData()
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('auth')
        localStorage.removeItem('rol')
        localStorage.removeItem('userName')
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserData])

  // Logout
  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('auth')
    localStorage.removeItem('rol')
    localStorage.removeItem('userName')
    setUser(null)
  }

  const hasRole = (roleName) => {
    return user?.roles?.includes(roleName) ?? false
  }

  const hasPermission = (permName) => {
    return user?.permisos?.includes(permName) ?? false
  }

  const value = {
    user,
    loading,
    refreshUser: fetchUserData,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para acceder al contexto de autenticación.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>.')
  }
  return context
}

export default AuthContext
