export function requirePermission(permisoRequerido) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticación requerida.' })
    }

    if (req.user.roles.includes('super_admin')) {
      return next()
    }

    if (req.user.roles.includes('admin')) {
      if (permisoRequerido === 'usuarios:eliminar') {
        return res.status(403).json({ error: 'Acceso denegado. Solo super_admin puede eliminar usuarios.' })
      }
      if (permisoRequerido === 'roles:admin') {
        return res.status(403).json({ error: 'Acceso denegado. Solo super_admin puede gestionar roles.' })
      }
      return next()
    }

    if (!req.user.permisos.includes(permisoRequerido)) {
      return res.status(403).json({
        error: 'Acceso denegado. No tienes el permiso necesario.',
        permisoFaltante: permisoRequerido,
      })
    }

    next()
  }
}

export function requireAnyPermission(permisos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticación requerida.' })
    }

    if (req.user.roles.includes('super_admin')) {
      return next()
    }

    if (req.user.roles.includes('admin')) {
      const bloqueados = ['usuarios:eliminar', 'roles:admin']
      const todosBloqueados = permisos.every(p => bloqueados.includes(p))
      if (todosBloqueados) {
        return res.status(403).json({
          error: 'Acceso denegado. Solo super_admin puede realizar estas acciones.',
        })
      }
      // Verificar que admin no tenga NINGÚN permiso bloqueado, no solo que no todos lo estén
      const tieneBloqueado = permisos.some(p => bloqueados.includes(p))
      if (tieneBloqueado) {
        return res.status(403).json({
          error: 'Acceso denegado. Este permiso está reservado para super_admin.',
        })
      }
      return next()
    }

    const tieneAlguno = permisos.some(p => req.user.permisos.includes(p))
    if (!tieneAlguno) {
      return res.status(403).json({
        error: 'Acceso denegado. No tienes ninguno de los permisos requeridos.',
      })
    }

    next()
  }
}
