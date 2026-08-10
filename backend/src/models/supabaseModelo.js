import { supabaseAdmin, supabase } from '../infrastructure/supabase.js'

const db = () => supabaseAdmin || supabase

// ─── Auth ─────────────────────────────────────────────────────────────

export async function obtenerUsuarioActual(userId) {
  const { data, error } = await db()
    .from('usuarios')
    .select('id, email, ci, nombre, apellidos, grado, activo')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function obtenerRolesUsuario(userId) {
  const { data } = await db()
    .from('usuarios_roles')
    .select('rol_id, roles(id, nombre)')
    .eq('usuario_id', userId)

  return (data || []).map(r => r.roles)
}

export async function obtenerPermisosUsuario(rolIds) {
  if (rolIds.length === 0) return []

  const { data } = await db()
    .from('roles_permisos')
    .select('permisos(nombre)')
    .in('rol_id', rolIds)

  return [...new Set((data || []).map(p => p.permisos.nombre))]
}

// ─── Mallas Curriculares ──────────────────────────────────────────────

export async function listarMallas() {
  const { data, error } = await db()
    .from('mallas_curriculares')
    .select('*')
    .order('year_start', { ascending: false })

  if (error) throw error
  return data
}

export async function obtenerMalla(id) {
  const { data, error } = await db()
    .from('mallas_curriculares')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function crearMalla(mallaData) {
  const { data, error } = await db()
    .from('mallas_curriculares')
    .insert(mallaData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function actualizarMalla(id, mallaData) {
  const { data, error } = await db()
    .from('mallas_curriculares')
    .update({ ...mallaData, actualizada_en: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarMalla(id) {
  const { error } = await db()
    .from('mallas_curriculares')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Semestres ────────────────────────────────────────────────────────

export async function listarSemestres(mallaId) {
  const { data, error } = await db()
    .from('semestres')
    .select('*')
    .eq('malla_id', mallaId)
    .order('numero')

  if (error) throw error
  return data
}

export async function obtenerSemestre(id) {
  const { data, error } = await db()
    .from('semestres')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ─── Ejes Curriculares ────────────────────────────────────────────────

export async function listarEjes(semestreId) {
  const { data, error } = await db()
    .from('ejes_curriculares')
    .select('*')
    .eq('semestre_id', semestreId)
    .order('orden')

  if (error) throw error
  return data
}

export async function actualizarEje(id, ejeData) {
  const { data, error } = await db()
    .from('ejes_curriculares')
    .update(ejeData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Ejes (helpers) ───────────────────────────────────────────────────

export async function obtenerEje(id) {
  const { data, error } = await db()
    .from('ejes_curriculares')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ─── Módulos ──────────────────────────────────────────────────────────

export async function listarModulos(ejeId) {
  const { data, error } = await db()
    .from('modulos')
    .select('*')
    .eq('eje_id', ejeId)
    .order('orden')

  if (error) throw error
  return data
}

export async function crearModulo(moduloData) {
  const { data, error } = await db()
    .from('modulos')
    .insert(moduloData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function actualizarModulo(id, moduloData) {
  const { data, error } = await db()
    .from('modulos')
    .update({ ...moduloData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarModulo(id) {
  const { error } = await db()
    .from('modulos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function obtenerModulo(id) {
  const { data, error } = await db()
    .from('modulos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function contarUCsDeModulo(moduloId) {
  const { count, error } = await db()
    .from('unidades_competencia')
    .select('id', { count: 'exact', head: true })
    .eq('modulo_id', moduloId)

  if (error) throw error
  return count || 0
}

// ─── Unidades de Competencia ──────────────────────────────────────────

export async function listarUnidadesCompetencia(moduloId) {
  let query = db().from('unidades_competencia').select('*')

  if (moduloId) {
    query = query.eq('modulo_id', moduloId)
  }

  const { data, error } = await query.order('orden')
  if (error) throw error
  return data
}

/**
 * Búsqueda global de UCs por código o nombre.
 * Devuelve UCs con datos del módulo padre (codigo, nombre).
 */
export async function buscarUnidadesCompetencia(texto) {
  let query = db()
    .from('unidades_competencia')
    .select('*, modulos:modulo_id(id, codigo, nombre, eje_id)')

  if (texto && texto.trim()) {
    const t = texto.trim()
    // ilike es case-insensitive en Supabase/Postgres
    query = query.or(`codigo.ilike.%${t}%,nombre.ilike.%${t}%`)
  }

  query = query.order('codigo').limit(100)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function obtenerUnidadCompetencia(id) {
  const { data, error } = await db()
    .from('unidades_competencia')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function crearUnidadCompetencia(ucData) {
  const { data, error } = await db()
    .from('unidades_competencia')
    .insert(ucData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function actualizarUnidadCompetencia(id, ucData) {
  const { data, error } = await db()
    .from('unidades_competencia')
    .update({ ...ucData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarUnidadCompetencia(id) {
  const { error } = await db()
    .from('unidades_competencia')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Elementos de Competencia ─────────────────────────────────────────

export async function listarElementosCompetencia(ucId) {
  const { data, error } = await db()
    .from('elementos_competencia')
    .select('*')
    .eq('unidad_competencia_id', ucId)
    .order('numero')

  if (error) throw error
  return data
}

export async function obtenerElementoCompetencia(id) {
  const { data, error } = await db()
    .from('elementos_competencia')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function siguienteNumeroElemento(ucId) {
  const { data, error } = await db()
    .from('elementos_competencia')
    .select('numero')
    .eq('unidad_competencia_id', ucId)
    .order('numero', { ascending: false })
    .limit(1)

  if (error) throw error
  return (data?.[0]?.numero || 0) + 1
}

export async function reordenarElementosCompetencia(ucId) {
  const { data, error } = await db()
    .from('elementos_competencia')
    .select('id, numero')
    .eq('unidad_competencia_id', ucId)
    .order('numero')

  if (error) throw error

  let n = 1
  for (const el of data || []) {
    if (el.numero !== n) {
      const { error: upErr } = await db()
        .from('elementos_competencia')
        .update({ numero: n, orden: n })
        .eq('id', el.id)
      if (upErr) throw upErr
    }
    n++
  }
}

export async function crearElementoCompetencia(data) {
  const { data: result, error } = await db()
    .from('elementos_competencia')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function actualizarElementoCompetencia(id, data) {
  const { data: result, error } = await db()
    .from('elementos_competencia')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function eliminarElementoCompetencia(id) {
  const { error } = await db()
    .from('elementos_competencia')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Unidades de Aprendizaje ─────────────────────────────────────────

export async function listarUnidadesAprendizaje(ucId) {
  const { data, error } = await db()
    .from('unidades_aprendizaje')
    .select('*')
    .eq('unidad_competencia_id', ucId)
    .order('numero')

  if (error) throw error
  return data
}

export async function obtenerUnidadAprendizaje(id) {
  const { data, error } = await db()
    .from('unidades_aprendizaje')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function siguienteNumeroUA(ucId) {
  const { data, error } = await db()
    .from('unidades_aprendizaje')
    .select('numero')
    .eq('unidad_competencia_id', ucId)
    .order('numero', { ascending: false })
    .limit(1)

  if (error) throw error
  return (data?.[0]?.numero || 0) + 1
}

export async function reordenarUnidadesAprendizaje(ucId) {
  const { data, error } = await db()
    .from('unidades_aprendizaje')
    .select('id, numero')
    .eq('unidad_competencia_id', ucId)
    .order('numero')

  if (error) throw error

  let n = 1
  for (const ua of data || []) {
    if (ua.numero !== n) {
      const { error: upErr } = await db()
        .from('unidades_aprendizaje')
        .update({ numero: n, orden: n })
        .eq('id', ua.id)
      if (upErr) throw upErr
    }
    n++
  }
}

export async function crearUnidadAprendizaje(data) {
  const { data: result, error } = await db()
    .from('unidades_aprendizaje')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function actualizarUnidadAprendizaje(id, data) {
  const { data: result, error } = await db()
    .from('unidades_aprendizaje')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function eliminarUnidadAprendizaje(id) {
  const { error } = await db()
    .from('unidades_aprendizaje')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Contenidos ───────────────────────────────────────────────────────

export async function listarContenidos(uaId) {
  const { data, error } = await db()
    .from('contenidos')
    .select('*')
    .eq('unidad_aprendizaje_id', uaId)
    .order('orden')

  if (error) throw error
  return data
}

export async function crearContenido(data) {
  const { data: result, error } = await db()
    .from('contenidos')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function actualizarContenido(id, data) {
  const { data: result, error } = await db()
    .from('contenidos')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function eliminarContenido(id) {
  const { error } = await db()
    .from('contenidos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Malla Completa (árbol anidado) ───────────────────────────────────
// Estructura: malla → semestres → ejes (academico|transversal)
//                                  → modulos → uc
//   cada uc → elementos_competencia + unidades_aprendizaje (contenido analítico)
//   cada ua → contenidos (bibliografía)

export async function obtenerMallaCompleta(mallaId) {
  const semestres = await listarSemestres(mallaId)

  const arbol = await Promise.all(semestres.map(async (sem) => {
    const ejes = await listarEjes(sem.id)

    const ejesCompletos = await Promise.all(ejes.map(async (eje) => {
      const modulos = await listarModulos(eje.id)

      const modulosCompletos = await Promise.all(modulos.map(async (mod) => {
        const unidades = await listarUnidadesCompetencia(mod.id)

        const unidadesCompletas = await Promise.all(unidades.map(async (uc) => {
          const [elementos, unidadesAp] = await Promise.all([
            listarElementosCompetencia(uc.id),
            listarUnidadesAprendizaje(uc.id),
          ])

          const unidadesApCompletas = await Promise.all((unidadesAp || []).map(async (ua) => {
            const contenidos = await listarContenidos(ua.id)
            return { ...ua, contenidos }
          }))

          return {
            ...uc,
            elementos_competencia: elementos,
            unidades_aprendizaje: unidadesApCompletas,
          }
        }))

        return { ...mod, unidades_competencia: unidadesCompletas }
      }))

      return { ...eje, modulos: modulosCompletos }
    }))

    return { ...sem, ejes_curriculares: ejesCompletos }
  }))

  return arbol
}

// ─── Usuarios ─────────────────────────────────────────────────────────

export async function listarUsuarios() {
  const { data, error } = await db()
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  const usuariosConRoles = await Promise.all((data || []).map(async (u) => {
    const { data: rolesData } = await db()
      .from('usuarios_roles')
      .select('rol_id, roles(id, nombre)')
      .eq('usuario_id', u.id)

    return {
      ...u,
      roles: (rolesData || []).map(r => r.roles),
    }
  }))

  return usuariosConRoles
}

export async function crearUsuario(usuarioData) {
  const { data, error } = await db()
    .from('usuarios')
    .insert(usuarioData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function actualizarUsuario(id, usuarioData) {
  const { data, error } = await db()
    .from('usuarios')
    .update({ ...usuarioData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarUsuario(id) {
  const { error } = await db()
    .from('usuarios')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function asignarRolUsuario(usuarioId, rolId, asignadoPor) {
  const { data: existente } = await db()
    .from('usuarios_roles')
    .select('usuario_id, rol_id')
    .eq('usuario_id', usuarioId)
    .eq('rol_id', rolId)
    .maybeSingle()

  if (existente) {
    return existente
  }

  const { data, error } = await db()
    .from('usuarios_roles')
    .insert({
      usuario_id: usuarioId,
      rol_id: rolId,
      asignado_por: asignadoPor || null,
      asignado_en: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function quitarRolUsuario(usuarioId, rolId) {
  const { error } = await db()
    .from('usuarios_roles')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('rol_id', rolId)

  if (error) throw error
}

export async function cambiarEstadoUsuario(usuarioId, activo) {
  const { data, error } = await db()
    .from('usuarios')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', usuarioId)
    .select('id, email, ci, nombre, apellidos, grado, activo')
    .single()

  if (error) throw error
  return data
}

// ─── Roles ────────────────────────────────────────────────────────────

export async function listarRoles() {
  const { data, error } = await db()
    .from('roles')
    .select('*')
    .order('id')

  if (error) throw error

  const rolesConPermisos = await Promise.all((data || []).map(async (rol) => {
    const { data: permisosData } = await db()
      .from('roles_permisos')
      .select('permiso_id, permisos(id, nombre, modulo)')
      .eq('rol_id', rol.id)

    return {
      ...rol,
      permisos: (permisosData || []).map(p => p.permisos),
    }
  }))

  return rolesConPermisos
}

export async function crearRol(data) {
  const { data: result, error } = await db()
    .from('roles')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function actualizarRol(id, data) {
  const { data: result, error } = await db()
    .from('roles')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function eliminarRol(id) {
  const { error } = await db()
    .from('roles')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Cuenta cuántos usuarios tienen un rol asignado.
 * Usado para impedir eliminar roles en uso.
 */
export async function contarUsuariosPorRol(rolId) {
  const { count, error } = await db()
    .from('usuarios_roles')
    .select('usuario_id', { count: 'exact', head: true })
    .eq('rol_id', rolId)

  if (error) throw error
  return count || 0
}

/**
 * Obtiene un rol por ID (para mostrar nombre en mensajes de error).
 */
export async function obtenerRol(id) {
  const { data, error } = await db()
    .from('roles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function asignarPermisoRol(rolId, permisoId) {
  const { data: existente } = await db()
    .from('roles_permisos')
    .select('rol_id, permiso_id')
    .eq('rol_id', rolId)
    .eq('permiso_id', permisoId)
    .maybeSingle()

  if (existente) {
    return existente
  }

  const { data, error } = await db()
    .from('roles_permisos')
    .insert({ rol_id: rolId, permiso_id: permisoId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function quitarPermisoRol(rolId, permisoId) {
  const { error } = await db()
    .from('roles_permisos')
    .delete()
    .eq('rol_id', rolId)
    .eq('permiso_id', permisoId)

  if (error) throw error
}

// ─── Permisos ─────────────────────────────────────────────────────────

export async function listarPermisos() {
  const { data, error } = await db()
    .from('permisos')
    .select('*')
    .order('id')

  if (error) throw error
  return data
}

// ─── Calendario ───────────────────────────────────────────────────────

export async function listarEventos(semestreId) {
  let query = db().from('calendario_eventos').select('*')

  if (semestreId) {
    query = query.eq('semestre_id', semestreId)
  }

  query = query.order('fecha')
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function crearEvento(eventoData) {
  const { data, error } = await db()
    .from('calendario_eventos')
    .insert(eventoData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function actualizarEvento(id, eventoData) {
  const { data, error } = await db()
    .from('calendario_eventos')
    .update({ ...eventoData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarEvento(id) {
  const { error } = await db()
    .from('calendario_eventos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Logs ─────────────────────────────────────────────────────────────

export async function listarLogs(filtros = {}) {
  let query = db()
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (filtros.usuario_id) query = query.eq('usuario_id', filtros.usuario_id)
  if (filtros.accion)     query = query.eq('accion', filtros.accion)
  if (filtros.tabla)      query = query.eq('tabla_afectada', filtros.tabla)

  const limit = filtros.limit || 100
  const offset = filtros.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) throw error
  return data
}
