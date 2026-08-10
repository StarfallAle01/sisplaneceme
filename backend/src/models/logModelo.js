import { supabaseAdmin, supabase } from '../infrastructure/supabase.js'

/**
 * Servicio para registrar acciones en la tabla logs.
 * Intenta usar el cliente admin primero; si no está disponible, usa el anónimo.
 */
export async function registrarLog({
  usuarioId,
  accion,
  tablaAfectada,
  registroId = null,
  detalles = {},
  ip = null,
  userAgent = null,
}) {
  try {
    const client = supabaseAdmin || supabase

    const { error } = await client
      .from('logs')
      .insert({
        usuario_id: usuarioId,
        accion,
        tabla_afectada: tablaAfectada,
        registro_id: registroId,
        detalles,
        ip,
        user_agent: userAgent,
      })

    if (error) {
      console.error('⚠️ Error al registrar log:', error.message)
    }
  } catch (err) {
    console.error('⚠️ Error al registrar log:', err.message)
  }
}

/**
 * Helper que construye el objeto de log desde req.
 */
export function buildLogFromReq(req, accion, tablaAfectada, registroId = null, detalles = {}) {
  return {
    usuarioId: req.user?.id || 'sistema',
    accion,
    tablaAfectada,
    registroId,
    detalles,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null,
  }
}
