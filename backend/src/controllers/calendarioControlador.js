import * as svc from '../models/supabaseModelo.js'
import { registrarLog, buildLogFromReq } from '../models/logModelo.js'

// ═══════════════════════════════════════════════════════════════════════════
// CALENDARIO DE EVENTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/calendario?semestre_id=1
 * Lista eventos del calendario. Puede filtrarse por semestre.
 */
export async function listarEventos(req, res) {
  try {
    const semestreId = req.query.semestre_id || null
    const eventos = await svc.listarEventos(semestreId)
    res.json(eventos)
  } catch (error) {
    console.error('Error listarEventos:', error.message)
    res.status(500).json({ error: 'Error al listar eventos.' })
  }
}

/**
 * POST /api/calendario
 * Crea un nuevo evento en el calendario.
 * Body: semestre_id, unidad_competencia_id, titulo, fecha, horas, tipo, color
 */
export async function crearEvento(req, res) {
  try {
    const data = {
      semestre_id: req.body.semestre_id,
      unidad_competencia_id: req.body.unidad_competencia_id || null,
      titulo: req.body.titulo,
      fecha: req.body.fecha,
      horas: req.body.horas || 0,
      tipo: req.body.tipo || 'clase',
      color: req.body.color || '#D4AF37',
    }

    const nuevo = await svc.crearEvento(data)

    await registrarLog(buildLogFromReq(req, 'create', 'calendario_eventos', nuevo.id, {
      titulo: nuevo.titulo,
      fecha: nuevo.fecha,
    }))

    res.status(201).json(nuevo)
  } catch (error) {
    console.error('Error crearEvento:', error.message)
    res.status(500).json({ error: 'Error al crear evento.' })
  }
}

/**
 * PUT /api/calendario/:id
 * Actualiza un evento existente.
 */
export async function actualizarEvento(req, res) {
  try {
    const { id } = req.params
    const data = {}
    if (req.body.titulo !== undefined)                  data.titulo = req.body.titulo
    if (req.body.fecha !== undefined)                   data.fecha = req.body.fecha
    if (req.body.horas !== undefined)                   data.horas = req.body.horas
    if (req.body.tipo !== undefined)                    data.tipo = req.body.tipo
    if (req.body.color !== undefined)                   data.color = req.body.color
    if (req.body.semestre_id !== undefined)             data.semestre_id = req.body.semestre_id
    if (req.body.unidad_competencia_id !== undefined)   data.unidad_competencia_id = req.body.unidad_competencia_id

    const actualizado = await svc.actualizarEvento(id, data)

    await registrarLog(buildLogFromReq(req, 'update', 'calendario_eventos', id, { cambios: data }))

    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarEvento:', error.message)
    res.status(500).json({ error: 'Error al actualizar evento.' })
  }
}

/**
 * DELETE /api/calendario/:id
 * Elimina un evento.
 */
export async function eliminarEvento(req, res) {
  try {
    const { id } = req.params
    await svc.eliminarEvento(id)

    await registrarLog(buildLogFromReq(req, 'delete', 'calendario_eventos', id))

    res.json({ mensaje: 'Evento eliminado exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarEvento:', error.message)
    res.status(500).json({ error: 'Error al eliminar evento.' })
  }
}

/**
 * POST /api/calendario/lote
 * Crea múltiples eventos en lote.
 * Body: { eventos: [{ semestre_id, titulo, fecha, horas, tipo, color, unidad_competencia_id }] }
 */
export async function crearEventosLote(req, res) {
  try {
    const eventos = req.body.eventos
    if (!Array.isArray(eventos) || eventos.length === 0) {
      return res.status(400).json({ error: 'Se requiere un arreglo de eventos.' })
    }

    const resultados = []
    const errores = []

    for (let i = 0; i < eventos.length; i++) {
      const ev = eventos[i]
      try {
        const data = {
          semestre_id: ev.semestre_id,
          unidad_competencia_id: ev.unidad_competencia_id || null,
          titulo: ev.titulo,
          fecha: ev.fecha,
          horas: ev.horas || 0,
          tipo: ev.tipo || 'clase',
          color: ev.color || '#D4AF37',
        }
        const nuevo = await svc.crearEvento(data)
        resultados.push(nuevo)
      } catch (err) {
        errores.push({ indice: i, titulo: ev.titulo, fecha: ev.fecha, error: err.message })
      }
    }

    await registrarLog(buildLogFromReq(req, 'create', 'calendario_eventos', 'lote', {
      creados: resultados.length,
      fallidos: errores.length,
    }))

    res.status(201).json({
      creados: resultados.length,
      fallidos: errores.length,
      resultados,
      errores: errores.length > 0 ? errores : undefined,
    })
  } catch (error) {
    console.error('Error crearEventosLote:', error.message)
    res.status(500).json({ error: 'Error al crear eventos en lote.' })
  }
}
