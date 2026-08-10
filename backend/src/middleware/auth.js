import { supabase, supabaseAdmin } from '../infrastructure/supabase.js'

export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acceso no proporcionado.' })
    }

    const token = authHeader.split(' ')[1]

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ error: 'Token inválido o sesión expirada.' })
    }

    // Buscar en public.usuarios por email o CI (desde metadata de auth)
    const userEmail = user.email || ''
    const userCi = user.user_metadata?.ci || userEmail.split('@')[0]

    let { data: usuarioDB } = await supabase
      .from('usuarios')
      .select('id, email, ci, nombre, apellidos, grado, activo')
      .or(`email.eq.${userEmail},ci.eq.${userCi}`)
      .maybeSingle()

    // Si no existe en public.usuarios, crearlo
    if (!usuarioDB) {
      const nuevoUsuario = {
        id: user.id,
        email: user.email,
        ci: userCi,
        nombre: user.user_metadata?.nombre || '',
        apellidos: user.user_metadata?.apellidos || '',
        grado: user.user_metadata?.grado || '',
        activo: true,
      }

      const client = supabaseAdmin || supabase
      const { data: creado, error: createError } = await client
        .from('usuarios')
        .insert(nuevoUsuario)
        .select('id, email, ci, nombre, apellidos, grado, activo')
        .single()

      if (createError) {
        console.error('Error al crear usuario en public.usuarios:', createError.message)
        return res.status(500).json({ error: 'Error al sincronizar usuario.' })
      }

      usuarioDB = creado
    } else if (usuarioDB.id !== user.id) {
      // El usuario existe pero con UUID diferente → actualizar al UUID de auth
      const client = supabaseAdmin || supabase
      const { error: updateError } = await client
        .from('usuarios')
        .update({ id: user.id })
        .eq('id', usuarioDB.id)

      if (updateError) {
        console.error('Error al sincronizar UUID de usuario:', updateError.message)
      } else {
        usuarioDB.id = user.id
      }
    }

    if (!usuarioDB.activo) {
      return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador.' })
    }

    // Obtener roles del usuario
    const { data: rolesData } = await supabase
      .from('usuarios_roles')
      .select('rol_id, roles!inner(id, nombre)')
      .eq('usuario_id', user.id)

    const roles = (rolesData || []).map(r => r.roles.nombre)

    // Obtener permisos del usuario (a través de roles_permisos)
    const rolIds = (rolesData || []).map(r => r.rol_id)

    let permisos = []
    if (rolIds.length > 0) {
      const { data: permsData } = await supabase
        .from('roles_permisos')
        .select('permiso_id, permisos!inner(nombre)')
        .in('rol_id', rolIds)

      permisos = [...new Set((permsData || []).map(p => p.permisos.nombre))]
    }

    req.user = {
      id: usuarioDB.id,
      email: usuarioDB.email,
      ci: usuarioDB.ci,
      nombre: `${usuarioDB.nombre || ''} ${usuarioDB.apellidos || ''}`.trim() || usuarioDB.email,
      grado: usuarioDB.grado,
      roles,
      permisos,
      accessToken: token,
    }

    next()
  } catch (error) {
    console.error('Error en auth middleware:', error.message)
    return res.status(500).json({ error: 'Error interno de autenticación.' })
  }
}
