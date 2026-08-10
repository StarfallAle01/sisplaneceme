import * as svc from '../models/supabaseModelo.js'

/**
 * GET /api/logs
 * Lista logs del sistema con filtros opcionales.
 * Solo super_admin y admin.
 *
 * Query params:
 *   - usuario_id   (filtro por usuario)
 *   - accion       (filtro por acción: login, create, update, delete)
 *   - tabla        (filtro por tabla afectada)
 *   - limit        (límite de resultados, default 100)
 *   - offset       (desplazamiento, default 0)
 */
export async function listarLogs(req, res) {
  try {
    const filtros = {
      usuario_id: req.query.usuario_id || null,
      accion: req.query.accion || null,
      tabla: req.query.tabla || null,
      limit: isNaN(parseInt(req.query.limit, 10)) ? 100 : parseInt(req.query.limit, 10),
      offset: isNaN(parseInt(req.query.offset, 10)) ? 0 : parseInt(req.query.offset, 10),
    }

    const logs = await svc.listarLogs(filtros)
    res.json(logs)
  } catch (error) {
    console.error('Error listarLogs:', error.message)
    res.status(500).json({ error: 'Error al listar logs.' })
  }
}
