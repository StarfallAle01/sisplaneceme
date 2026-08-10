import { useAuth } from '../contexts/AuthContext'

/**
 * Hook para verificar permisos del usuario actual.
 *
 * Jerarquía de roles:
 *   - super_admin: tiene todos los permisos, incluyendo 'roles:admin' y 'usuarios:eliminar'.
 *   - admin: tiene todos los permisos EXCEPTO 'usuarios:eliminar' y 'roles:admin'.
 *   - profesor: solo tiene los permisos explícitos en user.permisos[].
 *   - lector: solo tiene los permisos explícitos en user.permisos[] (típicamente solo lectura).
 *
 * Uso:
 *   const { can, canAny, isSuperAdmin, isAdmin, isProfesor, isLector, canWrite, roles, permisos } = usePermissions()
 *   if (can('mallas:admin')) { ... }
 */
export function usePermissions() {
  const { user } = useAuth()

  /**
   * Verifica si el usuario tiene un permiso específico.
   * Primero revisa roles (super_admin/admin tienen atajos),
   * luego cae a la lista explícita de permisos del backend.
   */
  const can = (permiso) => {
    if (!user) return false

    // super_admin tiene absolutamente todo
    if (user.roles?.includes('super_admin')) return true

    // admin tiene todo excepto 'usuarios:eliminar' y 'roles:admin'
    if (user.roles?.includes('admin')) {
      if (permiso === 'usuarios:eliminar' || permiso === 'roles:admin') return false
      return true
    }

    // Profesor y lector: solo lo que esté en permisos[]
    return user.permisos?.includes(permiso) ?? false
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos dados.
   */
  const canAny = (permisos) => {
    return permisos.some(p => can(p))
  }

  const isSuperAdmin = user?.roles?.includes('super_admin') ?? false
  const isAdmin      = user?.roles?.includes('admin') ?? false
  const isProfesor   = user?.roles?.includes('profesor') ?? false
  const isLector     = user?.roles?.includes('lector') ?? false

  /**
   * Verifica si el rol del usuario permite operaciones de escritura.
   */
  const canWrite = isSuperAdmin || isAdmin

  return {
    can,
    canAny,
    isSuperAdmin,
    isAdmin,
    isProfesor,
    isLector,
    canWrite,
    roles: user?.roles || [],
    permisos: user?.permisos || [],
  }
}
