import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'

/**
 * Ruta protegida por autenticación y permisos.
 *
 * Props:
 *   - children: Componente a renderizar si está autorizado.
 *   - requiredPermission: (opcional) Permiso necesario para acceder.
 *   - requiredRole: (opcional) Rol necesario para acceder.
 */
export default function RutaProtegida({
  children,
  requiredPermission = null,
  requiredRole = null,
}) {
  const { user, loading } = useAuth()
  const { can } = usePermissions()

  // 1. Cargando sesión → mostrar spinner
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A1628' }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: '#C5A028', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#FFFFFF', opacity: 0.45 }}>Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // 2. No autenticado → redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 3. Verificar permiso específico (si se requiere)
  if (requiredPermission) {
    if (!can(requiredPermission)) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center"
          style={{ backgroundColor: '#0A1628' }}
        >
          <h1
            className="font-heading text-4xl mb-4"
            style={{ color: '#C5A028' }}
          >
            403
          </h1>
          <p style={{ color: '#FFFFFF', opacity: 0.6 }}>Acceso denegado.</p>
          <p style={{ color: '#FFFFFF', opacity: 0.4, fontSize: '14px' }} className="mt-2">
            No tienes los permisos necesarios para acceder a esta página.
          </p>
        </div>
      )
    }
  }

  // 4. Verificar rol específico (si se requiere)
  if (requiredRole) {
    if (!user.roles?.includes(requiredRole)) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center"
          style={{ backgroundColor: '#0A1628' }}
        >
          <h1
            className="font-heading text-4xl mb-4"
            style={{ color: '#C5A028' }}
          >
            403
          </h1>
          <p style={{ color: '#FFFFFF', opacity: 0.6 }}>Acceso restringido.</p>
          <p style={{ color: '#FFFFFF', opacity: 0.4, fontSize: '14px' }} className="mt-2">
            Esta sección requiere rol de {requiredRole}.
          </p>
        </div>
      )
    }
  }

  // 5. Todo OK → renderizar children
  return children
}
