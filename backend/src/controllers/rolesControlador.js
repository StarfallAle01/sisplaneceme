import * as svc from '../models/supabaseModelo.js'
import { registrarLog, buildLogFromReq } from '../models/logModelo.js'

// El rol super_admin está protegido frente a CUALQUIER usuario que no sea
// super_admin: un admin no puede eliminarlo ni quitarle permisos. Un
// super_admin sí puede modificar sus propios permisos.
const ROL_PROTEGIDO = 'super_admin'
const actorEsSuperAdmin = (req) => req.user?.roles?.includes('super_admin') ?? false

// ═══════════════════════════════════════════════════════════════════════════
// ROLES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/roles
 * Lista todos los roles con sus permisos.
 */
export async function listarRoles(req, res) {
  try {
    const roles = await svc.listarRoles()
    res.json(roles)
  } catch (error) {
    console.error('Error listarRoles:', error.message)
    res.status(500).json({ error: 'Error al listar roles.' })
  }
}

/**
 * POST /api/roles
 * Crea un nuevo rol.
 */
export async function crearRol(req, res) {
  try {
    const data = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion || null,
    }

    const nuevo = await svc.crearRol(data)

    await registrarLog(buildLogFromReq(req, 'create', 'roles', nuevo.id, {
      nombre: nuevo.nombre,
    }))

    res.status(201).json(nuevo)
  } catch (error) {
    console.error('Error crearRol:', error.message)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un rol con ese nombre.' })
    }
    res.status(500).json({ error: 'Error al crear rol.' })
  }
}

/**
 * PUT /api/roles/:id
 * Actualiza un rol existente.
 */
export async function actualizarRol(req, res) {
  try {
    const { id } = req.params
    const data = {}
    if (req.body.nombre !== undefined)      data.nombre = req.body.nombre
    if (req.body.descripcion !== undefined) data.descripcion = req.body.descripcion

    const actualizado = await svc.actualizarRol(id, data)

    await registrarLog(buildLogFromReq(req, 'update', 'roles', id, { cambios: data }))

    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarRol:', error.message)
    if (error.message?.includes('multiple (or no) rows returned')) {
      return res.status(404).json({ error: 'Rol no encontrado.' })
    }
    res.status(500).json({ error: 'Error al actualizar rol.' })
  }
}

/**
 * DELETE /api/roles/:id
 * Elimina un rol.
 *
 * Rechaza la eliminación si el rol tiene usuarios asignados — el admin
 * debe reasignar o eliminar esos usuarios primero.
 */
export async function eliminarRol(req, res) {
  try {
    const { id } = req.params

    const rol = await svc.obtenerRol(id)
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado.' })

    if (rol.nombre === ROL_PROTEGIDO && !actorEsSuperAdmin(req)) {
      return res.status(403).json({ error: 'El rol super_admin está protegido y no puede eliminarse.' })
    }

    const usuariosAsignados = await svc.contarUsuariosPorRol(id)
    if (usuariosAsignados > 0) {
      return res.status(400).json({
        error: `No se puede eliminar el rol '${rol.nombre}' porque tiene ${usuariosAsignados} usuario(s) asignado(s). Reasigna o elimina esos usuarios primero.`,
        code: 'ROL_CON_USUARIOS',
        usuarios_afectados: usuariosAsignados,
        rol_nombre: rol.nombre,
      })
    }

    await svc.eliminarRol(id)

    await registrarLog(buildLogFromReq(req, 'delete', 'roles', id, { nombre: rol.nombre }))

    res.json({ mensaje: 'Rol eliminado exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarRol:', error.message)
    res.status(500).json({ error: 'Error al eliminar rol.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PERMISOS DE ROL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/roles/:id/permisos
 * Asigna un permiso a un rol.
 */
export async function asignarPermisoRol(req, res) {
  try {
    const rolId = req.params.id
    const { permiso_id } = req.body

    const rol = await svc.obtenerRol(rolId).catch(() => null)
    if (rol?.nombre === ROL_PROTEGIDO && !actorEsSuperAdmin(req)) {
      return res.status(403).json({ error: 'El rol super_admin está protegido y sus permisos no pueden modificarse.' })
    }

    const resultado = await svc.asignarPermisoRol(rolId, permiso_id)

    await registrarLog(buildLogFromReq(req, 'update', 'roles_permisos', resultado.id, {
      rol_id: rolId,
      permiso_id,
    }))

    res.status(201).json({ mensaje: 'Permiso asignado al rol exitosamente.', ...resultado })
  } catch (error) {
    console.error('Error asignarPermisoRol:', error.message)
    res.status(500).json({ error: 'Error al asignar permiso al rol.' })
  }
}

/**
 * DELETE /api/roles/:id/permisos/:permisoId
 * Quita un permiso a un rol.
 */
export async function quitarPermisoRol(req, res) {
  try {
    const { id: rolId, permisoId } = req.params

    const rol = await svc.obtenerRol(rolId).catch(() => null)
    if (rol?.nombre === ROL_PROTEGIDO && !actorEsSuperAdmin(req)) {
      return res.status(403).json({ error: 'El rol super_admin está protegido y sus permisos no pueden modificarse.' })
    }

    await svc.quitarPermisoRol(rolId, permisoId)

    await registrarLog(buildLogFromReq(req, 'delete', 'roles_permisos', null, {
      rol_id: rolId,
      permiso_id: permisoId,
    }))

    res.json({ mensaje: 'Permiso removido del rol exitosamente.' })
  } catch (error) {
    console.error('Error quitarPermisoRol:', error.message)
    res.status(500).json({ error: 'Error al quitar permiso del rol.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PERMISOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/permisos
 * Lista todos los permisos disponibles.
 */
export async function listarPermisos(req, res) {
  try {
    const permisos = await svc.listarPermisos()
    res.json(permisos)
  } catch (error) {
    console.error('Error listarPermisos:', error.message)
    res.status(500).json({ error: 'Error al listar permisos.' })
  }
}
