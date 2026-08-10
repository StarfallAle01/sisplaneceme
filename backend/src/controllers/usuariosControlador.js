import * as svc from '../models/supabaseModelo.js'
import { registrarLog, buildLogFromReq } from '../models/logModelo.js'
import { getAdminClient } from '../infrastructure/supabase.js'

// ═══════════════════════════════════════════════════════════════════════════
// PROTECCIÓN DEL SUPER ADMINISTRADOR
// ═══════════════════════════════════════════════════════════════════════════
// Un usuario que no es super_admin NO puede modificar (editar, desactivar ni
// cambiar los roles de) una cuenta que tenga el rol super_admin. Esto evita
// que un administrador "normal" deje fuera de juego a un super administrador.

const actorEsSuperAdmin = (req) => req.user?.roles?.includes('super_admin') ?? false

async function usuarioEsSuperAdmin(userId) {
  try {
    const roles = await svc.obtenerRolesUsuario(userId)
    return (roles || []).some(r => r?.nombre === 'super_admin')
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// USUARIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/usuarios
 * Lista todos los usuarios con sus roles.
 * Solo super_admin y admin.
 */
export async function listarUsuarios(req, res) {
  try {
    const usuarios = await svc.listarUsuarios()
    res.json(usuarios)
  } catch (error) {
    console.error('Error listarUsuarios:', error.message)
    res.status(500).json({ error: 'Error al listar usuarios.' })
  }
}

/**
 * POST /api/usuarios
 * Crea un nuevo usuario.
 * Solo super_admin.
 */
export async function crearUsuario(req, res) {
  const emailRaw = req.body.email
  const email = emailRaw === '' || emailRaw === undefined ? null : emailRaw
  const password = req.body.password

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña es requerida y debe tener al menos 6 caracteres.' })
  }
  if (!email) {
    return res.status(400).json({ error: 'El email es requerido para crear la cuenta de acceso.' })
  }

  let adminClient
  try {
    adminClient = getAdminClient()
  } catch {
    return res.status(500).json({ error: 'Servicio de administración no disponible. Configure SUPABASE_SERVICE_ROLE_KEY.' })
  }

  // 1. Crear cuenta en Supabase Auth primero para obtener el UUID real
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      ci: req.body.ci,
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      grado: req.body.grado || '',
    },
  })

  if (authError) {
    console.error('Error al crear usuario en Auth:', authError.message)
    if (authError.message?.includes('already registered')) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' })
    }
    return res.status(500).json({ error: 'Error al crear la cuenta de acceso: ' + authError.message })
  }

  // 2. Crear el registro en public.usuarios usando el UUID de Auth
  try {
    const usuarioData = {
      id: authData.user.id,
      email,
      ci: req.body.ci,
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      grado: req.body.grado || null,
      activo: req.body.activo !== undefined ? req.body.activo : true,
    }

    const nuevo = await svc.crearUsuario(usuarioData)

    await registrarLog(buildLogFromReq(req, 'create', 'usuarios', nuevo.id, {
      email: nuevo.email,
      ci: nuevo.ci,
    }))

    res.status(201).json(nuevo)
  } catch (error) {
    // Si falla la inserción en public.usuarios, limpiar la cuenta Auth creada
    console.error('Error crearUsuario en public.usuarios:', error.message)
    await adminClient.auth.admin.deleteUser(authData.user.id).catch(() => {})
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese CI.' })
    }
    res.status(500).json({ error: 'Error al crear usuario.' })
  }
}

/**
 * PUT /api/usuarios/:id
 * Actualiza datos de un usuario.
 * Solo super_admin y admin.
 */
export async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params

    if (!actorEsSuperAdmin(req) && await usuarioEsSuperAdmin(id)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar a un super administrador.' })
    }

    const usuarioData = {}
    if (req.body.email !== undefined)     usuarioData.email = req.body.email
    if (req.body.ci !== undefined)        usuarioData.ci = req.body.ci
    if (req.body.nombre !== undefined)    usuarioData.nombre = req.body.nombre
    if (req.body.apellidos !== undefined) usuarioData.apellidos = req.body.apellidos
    if (req.body.grado !== undefined)     usuarioData.grado = req.body.grado
    if (req.body.activo !== undefined)    usuarioData.activo = req.body.activo

    const actualizado = await svc.actualizarUsuario(id, usuarioData)

    await registrarLog(buildLogFromReq(req, 'update', 'usuarios', id, { cambios: usuarioData }))

    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarUsuario:', error.message)
    if (error.message?.includes('multiple (or no) rows returned')) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }
    res.status(500).json({ error: 'Error al actualizar usuario.' })
  }
}

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario. Solo super_admin.
 */
export async function eliminarUsuario(req, res) {
  let adminClient
  try {
    adminClient = getAdminClient()
  } catch {
    return res.status(500).json({ error: 'Servicio de administración no disponible. Configure SUPABASE_SERVICE_ROLE_KEY.' })
  }

  try {
    const { id } = req.params

    // Primero eliminar de public.usuarios
    await svc.eliminarUsuario(id)

    // Luego eliminar de auth.users para que no pueda reautenticarse
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)
    if (authError) {
      console.error('Advertencia: usuario eliminado de public.usuarios pero no de auth.users:', authError.message)
    }

    await registrarLog(buildLogFromReq(req, 'delete', 'usuarios', id))

    res.json({ mensaje: 'Usuario eliminado exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarUsuario:', error.message)
    res.status(500).json({ error: 'Error al eliminar usuario.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLES DE USUARIO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/usuarios/:id/roles
 * Asigna un rol a un usuario.
 * Solo super_admin.
 */
export async function asignarRol(req, res) {
  try {
    const usuarioId = req.params.id
    const { rol_id } = req.body

    // Solo un super_admin puede otorgar el rol super_admin o modificar los
    // roles de una cuenta que ya es super_admin.
    if (!actorEsSuperAdmin(req)) {
      if (await usuarioEsSuperAdmin(usuarioId)) {
        return res.status(403).json({ error: 'No tienes permiso para modificar los roles de un super administrador.' })
      }
      const rol = await svc.obtenerRol(rol_id).catch(() => null)
      if (rol?.nombre === 'super_admin') {
        return res.status(403).json({ error: 'Solo un super administrador puede otorgar el rol super_admin.' })
      }
    }

    const resultado = await svc.asignarRolUsuario(usuarioId, rol_id)

    await registrarLog(buildLogFromReq(req, 'update', 'usuarios_roles', resultado.id, {
      usuario_id: usuarioId,
      rol_id,
    }))

    res.status(201).json({ mensaje: 'Rol asignado exitosamente.', ...resultado })
  } catch (error) {
    console.error('Error asignarRol:', error.message)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El usuario ya tiene ese rol asignado.' })
    }
    res.status(500).json({ error: 'Error al asignar rol.' })
  }
}

/**
 * DELETE /api/usuarios/:id/roles/:rolId
 * Quita un rol a un usuario.
 * Solo super_admin.
 */
export async function quitarRol(req, res) {
  try {
    const { id: usuarioId, rolId } = req.params
    await svc.quitarRolUsuario(usuarioId, rolId)

    await registrarLog(buildLogFromReq(req, 'delete', 'usuarios_roles', null, {
      usuario_id: usuarioId,
      rol_id: rolId,
    }))

    res.json({ mensaje: 'Rol removido exitosamente.' })
  } catch (error) {
    console.error('Error quitarRol:', error.message)
    res.status(500).json({ error: 'Error al quitar rol.' })
  }
}

/**
 * PATCH /api/usuarios/:id/estado
 * Activa o desactiva un usuario.
 * Solo super_admin y admin.
 */
export async function cambiarEstado(req, res) {
  try {
    const { id } = req.params
    const { activo } = req.body

    if (!actorEsSuperAdmin(req) && await usuarioEsSuperAdmin(id)) {
      return res.status(403).json({ error: 'No tienes permiso para cambiar el estado de un super administrador.' })
    }

    const usuario = await svc.cambiarEstadoUsuario(id, activo)

    await registrarLog(buildLogFromReq(req, 'update', 'usuarios', id, { activo }))

    res.json(usuario)
  } catch (error) {
    console.error('Error cambiarEstado:', error.message)
    res.status(500).json({ error: 'Error al cambiar estado del usuario.' })
  }
}
