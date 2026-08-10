import * as svc from '../models/supabaseModelo.js'
import { registrarLog, buildLogFromReq } from '../models/logModelo.js'

// ═══════════════════════════════════════════════════════════════════════════
// MALLAS CURRICULARES
// ═══════════════════════════════════════════════════════════════════════════

export async function listarMallas(req, res) {
  try {
    const mallas = await svc.listarMallas()
    res.json(mallas)
  } catch (error) {
    console.error('Error listarMallas:', error.message)
    res.status(500).json({ error: 'Error al listar mallas curriculares.' })
  }
}

export async function obtenerMalla(req, res) {
  try {
    const malla = await svc.obtenerMalla(req.params.id)
    if (!malla) return res.status(404).json({ error: 'Malla no encontrada.' })
    res.json(malla)
  } catch (error) {
    console.error('Error obtenerMalla:', error.message)
    res.status(500).json({ error: 'Error al obtener malla.' })
  }
}

export async function crearMalla(req, res) {
  try {
    const mallaData = {
      nombre: req.body.nombre,
      year_start: req.body.year_start,
      descripcion: req.body.descripcion || null,
      estado: req.body.estado || 'borrador',
    }

    const nueva = await svc.crearMalla(mallaData)

    await registrarLog(buildLogFromReq(req, 'create', 'mallas_curriculares', nueva.id, {
      nombre: nueva.nombre,
      year_start: nueva.year_start,
    }))

    res.status(201).json(nueva)
  } catch (error) {
    console.error('Error crearMalla:', error.message)
    if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
      return res.status(409).json({ error: 'Ya existe una malla para ese año.' })
    }
    if (error.code === '23514' || /check/i.test(error.message)) {
      return res.status(400).json({ error: 'year_start debe ser un año par.' })
    }
    res.status(500).json({ error: 'Error al crear malla.' })
  }
}

export async function actualizarMalla(req, res) {
  try {
    const id = req.params.id
    const existente = await svc.obtenerMalla(id)
    if (!existente) return res.status(404).json({ error: 'Malla no encontrada.' })

    const mallaData = {}
    if (req.body.nombre !== undefined)       mallaData.nombre = req.body.nombre
    if (req.body.year_start !== undefined)   mallaData.year_start = req.body.year_start
    if (req.body.descripcion !== undefined)  mallaData.descripcion = req.body.descripcion
    if (req.body.estado !== undefined)       mallaData.estado = req.body.estado

    if (mallaData.year_start !== undefined && mallaData.year_start !== null && mallaData.year_start % 2 !== 0) {
      return res.status(400).json({ error: 'year_start debe ser un año par.' })
    }
    if (mallaData.year_start === null) {
      return res.status(400).json({ error: 'year_start no puede ser nulo.' })
    }

    const actualizada = await svc.actualizarMalla(id, mallaData)

    await registrarLog(buildLogFromReq(req, 'update', 'mallas_curriculares', id, { cambios: mallaData }))

    res.json(actualizada)
  } catch (error) {
    console.error('Error actualizarMalla:', error.message)
    if (error.code === '23505') return res.status(409).json({ error: 'Ya existe una malla para ese año.' })
    res.status(500).json({ error: 'Error al actualizar malla.' })
  }
}

export async function eliminarMalla(req, res) {
  try {
    const id = req.params.id
    const existente = await svc.obtenerMalla(id)
    if (!existente) return res.status(404).json({ error: 'Malla no encontrada.' })

    await svc.eliminarMalla(id)

    await registrarLog(buildLogFromReq(req, 'delete', 'mallas_curriculares', id, {
      nombre: existente.nombre,
    }))

    res.json({ mensaje: 'Malla eliminada exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarMalla:', error.message)
    res.status(500).json({ error: 'Error al eliminar malla.' })
  }
}

export async function obtenerMallaCompleta(req, res) {
  try {
    const malla = await svc.obtenerMalla(req.params.id)
    if (!malla) return res.status(404).json({ error: 'Malla no encontrada.' })

    const arbol = await svc.obtenerMallaCompleta(req.params.id)
    res.json({ ...malla, semestres: arbol })
  } catch (error) {
    console.error('Error obtenerMallaCompleta:', error.message)
    res.status(500).json({ error: 'Error al obtener malla completa.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEMESTRES — sólo lectura (los crea el trigger de BD)
// ═══════════════════════════════════════════════════════════════════════════

export async function listarSemestres(req, res) {
  try {
    const semestres = await svc.listarSemestres(req.params.mallaId)
    res.json(semestres)
  } catch (error) {
    console.error('Error listarSemestres:', error.message)
    res.status(500).json({ error: 'Error al listar semestres.' })
  }
}

export async function obtenerSemestre(req, res) {
  try {
    const semestre = await svc.obtenerSemestre(req.params.id)
    if (!semestre) return res.status(404).json({ error: 'Semestre no encontrado.' })
    res.json(semestre)
  } catch (error) {
    console.error('Error obtenerSemestre:', error.message)
    res.status(500).json({ error: 'Error al obtener semestre.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EJES CURRICULARES — sólo lectura + edición limitada (color/orden)
// ═══════════════════════════════════════════════════════════════════════════

export async function listarEjes(req, res) {
  try {
    const ejes = await svc.listarEjes(req.params.semestreId)
    res.json(ejes)
  } catch (error) {
    console.error('Error listarEjes:', error.message)
    res.status(500).json({ error: 'Error al listar ejes.' })
  }
}

export async function obtenerEje(req, res) {
  try {
    const eje = await svc.obtenerEje(req.params.id)
    if (!eje) return res.status(404).json({ error: 'Eje no encontrado.' })
    res.json(eje)
  } catch (error) {
    console.error('Error obtenerEje:', error.message)
    res.status(500).json({ error: 'Error al obtener eje.' })
  }
}

export async function actualizarEje(req, res) {
  try {
    const { id } = req.params
    // Sólo permitimos cambiar color y orden — no nombre, tipo ni es_fijo.
    const data = {}
    if (req.body.color !== undefined) data.color = req.body.color
    if (req.body.orden !== undefined) data.orden = req.body.orden

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No hay cambios permitidos (sólo color y orden son editables en ejes fijos).' })
    }

    const actualizado = await svc.actualizarEje(id, data)
    await registrarLog(buildLogFromReq(req, 'update', 'ejes_curriculares', id, { cambios: data }))
    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarEje:', error.message)
    res.status(500).json({ error: 'Error al actualizar eje.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MÓDULOS
// ═══════════════════════════════════════════════════════════════════════════

async function ejeEsAcademicoOFallar(ejeId, res) {
  const eje = await svc.obtenerEje(ejeId)
  if (!eje) {
    res.status(404).json({ error: 'Eje no encontrado.' })
    return null
  }
  if (eje.tipo === 'transversal') {
    res.status(403).json({ error: 'No se pueden crear/modificar/eliminar módulos en ejes transversales. Los módulos transversales son fijos del sistema.' })
    return null
  }
  return eje
}

export async function listarModulos(req, res) {
  try {
    const modulos = await svc.listarModulos(req.params.ejeId)
    res.json(modulos)
  } catch (error) {
    console.error('Error listarModulos:', error.message)
    res.status(500).json({ error: 'Error al listar módulos.' })
  }
}

export async function crearModulo(req, res) {
  try {
    const ejeId = parseInt(req.params.ejeId)
    const eje = await ejeEsAcademicoOFallar(ejeId, res)
    if (!eje) return

    // Nota: la tabla `modulos` NO tiene columna `dias` (solo las unidades de
    // competencia la tienen). Incluirla provoca un error de inserción.
    const data = {
      eje_id: ejeId,
      codigo: req.body.codigo,
      nombre: req.body.nombre,
      competencia_general: req.body.competencia_general ?? null,
      horas_teoricas: req.body.horas_teoricas ?? 0,
      horas_practicas: req.body.horas_practicas ?? 0,
      horas_totales: req.body.horas_totales ?? 0,
      orden: req.body.orden ?? 1,
    }

    const nuevo = await svc.crearModulo(data)

    await registrarLog(buildLogFromReq(req, 'create', 'modulos', nuevo.id, {
      codigo: nuevo.codigo,
      nombre: nuevo.nombre,
    }))

    res.status(201).json(nuevo)
  } catch (error) {
    console.error('Error crearModulo:', error.message)
    res.status(500).json({ error: 'Error al crear módulo.' })
  }
}

export async function actualizarModulo(req, res) {
  try {
    const { id } = req.params
    const existente = await svc.obtenerModulo(id)
    if (!existente) return res.status(404).json({ error: 'Módulo no encontrado.' })

    const eje = await ejeEsAcademicoOFallar(existente.eje_id, res)
    if (!eje) return

    const data = {}
    if (req.body.codigo !== undefined)               data.codigo = req.body.codigo
    if (req.body.nombre !== undefined)               data.nombre = req.body.nombre
    if (req.body.competencia_general !== undefined)  data.competencia_general = req.body.competencia_general
    if (req.body.horas_teoricas !== undefined)       data.horas_teoricas = req.body.horas_teoricas
    if (req.body.horas_practicas !== undefined)      data.horas_practicas = req.body.horas_practicas
    if (req.body.horas_totales !== undefined)        data.horas_totales = req.body.horas_totales
    if (req.body.orden !== undefined)                data.orden = req.body.orden

    const actualizado = await svc.actualizarModulo(id, data)

    await registrarLog(buildLogFromReq(req, 'update', 'modulos', id, { cambios: data }))

    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarModulo:', error.message)
    res.status(500).json({ error: 'Error al actualizar módulo.' })
  }
}

export async function eliminarModulo(req, res) {
  try {
    const { id } = req.params

    const existente = await svc.obtenerModulo(id)
    if (!existente) return res.status(404).json({ error: 'Módulo no encontrado.' })

    const eje = await ejeEsAcademicoOFallar(existente.eje_id, res)
    if (!eje) return

    const ucs = await svc.contarUCsDeModulo(id)
    if (ucs > 0) {
      return res.status(409).json({
        error: `No se puede eliminar el módulo porque tiene ${ucs} unidad(es) de competencia asociada(s). Elimínelas primero.`,
      })
    }

    await svc.eliminarModulo(id)
    await registrarLog(buildLogFromReq(req, 'delete', 'modulos', id))
    res.json({ mensaje: 'Módulo eliminado exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarModulo:', error.message)
    res.status(500).json({ error: 'Error al eliminar módulo.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIDADES DE COMPETENCIA
// ═══════════════════════════════════════════════════════════════════════════

export async function listarUnidadesCompetencia(req, res) {
  try {
    const moduloId = req.query.modulo_id || null
    const search = req.query.search

    // Si hay parámetro `search`, usar búsqueda global con join al módulo
    if (search !== undefined) {
      const resultados = await svc.buscarUnidadesCompetencia(search)
      return res.json(resultados)
    }

    const unidades = await svc.listarUnidadesCompetencia(moduloId)
    res.json(unidades)
  } catch (error) {
    console.error('Error listarUnidadesCompetencia:', error.message)
    res.status(500).json({ error: 'Error al listar unidades de competencia.' })
  }
}

export async function listarUCsPorModulo(req, res) {
  try {
    const unidades = await svc.listarUnidadesCompetencia(req.params.moduloId)
    res.json(unidades)
  } catch (error) {
    console.error('Error listarUCsPorModulo:', error.message)
    res.status(500).json({ error: 'Error al listar unidades de competencia.' })
  }
}

export async function obtenerUnidadCompetencia(req, res) {
  try {
    const uc = await svc.obtenerUnidadCompetencia(req.params.id)
    if (!uc) return res.status(404).json({ error: 'Unidad de competencia no encontrada.' })
    res.json(uc)
  } catch (error) {
    console.error('Error obtenerUnidadCompetencia:', error.message)
    res.status(500).json({ error: 'Error al obtener unidad de competencia.' })
  }
}

export async function crearUnidadCompetencia(req, res) {
  try {
    const data = {
      modulo_id: req.body.modulo_id,
      codigo: req.body.codigo,
      nombre: req.body.nombre,
      competencia_general: req.body.competencia_general ?? null,
      dias: req.body.dias ?? null,
      horas_teoricas: req.body.horas_teoricas ?? 0,
      horas_practicas: req.body.horas_practicas ?? 0,
      horas_totales: req.body.horas_totales ?? 0,
      orden: req.body.orden ?? 1,
    }

    const nuevo = await svc.crearUnidadCompetencia(data)

    await registrarLog(buildLogFromReq(req, 'create', 'unidades_competencia', nuevo.id, {
      codigo: nuevo.codigo,
      nombre: nuevo.nombre,
    }))

    res.status(201).json(nuevo)
  } catch (error) {
    console.error('Error crearUnidadCompetencia:', error.message)
    res.status(500).json({ error: 'Error al crear unidad de competencia.' })
  }
}

export async function actualizarUnidadCompetencia(req, res) {
  try {
    const { id } = req.params
    const data = {}
    if (req.body.modulo_id !== undefined)            data.modulo_id = req.body.modulo_id
    if (req.body.codigo !== undefined)               data.codigo = req.body.codigo
    if (req.body.nombre !== undefined)               data.nombre = req.body.nombre
    if (req.body.competencia_general !== undefined)  data.competencia_general = req.body.competencia_general
    if (req.body.dias !== undefined)                 data.dias = req.body.dias
    if (req.body.horas_teoricas !== undefined)       data.horas_teoricas = req.body.horas_teoricas
    if (req.body.horas_practicas !== undefined)      data.horas_practicas = req.body.horas_practicas
    if (req.body.horas_totales !== undefined)        data.horas_totales = req.body.horas_totales
    if (req.body.orden !== undefined)                data.orden = req.body.orden

    const actualizado = await svc.actualizarUnidadCompetencia(id, data)

    await registrarLog(buildLogFromReq(req, 'update', 'unidades_competencia', id, { cambios: data }))

    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarUnidadCompetencia:', error.message)
    res.status(500).json({ error: 'Error al actualizar unidad de competencia.' })
  }
}

export async function eliminarUnidadCompetencia(req, res) {
  try {
    const { id } = req.params
    await svc.eliminarUnidadCompetencia(id)

    await registrarLog(buildLogFromReq(req, 'delete', 'unidades_competencia', id))

    res.json({ mensaje: 'Unidad de competencia eliminada exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarUnidadCompetencia:', error.message)
    res.status(500).json({ error: 'Error al eliminar unidad de competencia.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ELEMENTOS DE COMPETENCIA
// ═══════════════════════════════════════════════════════════════════════════

export async function listarElementosCompetencia(req, res) {
  try {
    const elementos = await svc.listarElementosCompetencia(req.params.ucId)
    res.json(elementos)
  } catch (error) {
    console.error('Error listarElementosCompetencia:', error.message)
    res.status(500).json({ error: 'Error al listar elementos de competencia.' })
  }
}

export async function crearElementoCompetencia(req, res) {
  try {
    const ucId = parseInt(req.params.ucId)
    const numero = await svc.siguienteNumeroElemento(ucId)

    const data = {
      unidad_competencia_id: ucId,
      numero,
      titulo: req.body.titulo,
      descripcion: req.body.descripcion ?? null,
      orden: numero,
    }

    const nuevo = await svc.crearElementoCompetencia(data)

    await registrarLog(buildLogFromReq(req, 'create', 'elementos_competencia', nuevo.id, {
      unidad_competencia_id: ucId,
      numero,
    }))

    res.status(201).json(nuevo)
  } catch (error) {
    console.error('Error crearElementoCompetencia:', error.message)
    res.status(500).json({ error: 'Error al crear elemento de competencia.' })
  }
}

export async function actualizarElementoCompetencia(req, res) {
  try {
    const { id } = req.params
    const data = {}
    if (req.body.titulo !== undefined)      data.titulo = req.body.titulo
    if (req.body.descripcion !== undefined) data.descripcion = req.body.descripcion

    const actualizado = await svc.actualizarElementoCompetencia(id, data)

    await registrarLog(buildLogFromReq(req, 'update', 'elementos_competencia', id, { cambios: data }))

    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarElementoCompetencia:', error.message)
    res.status(500).json({ error: 'Error al actualizar elemento de competencia.' })
  }
}

export async function eliminarElementoCompetencia(req, res) {
  try {
    const { id } = req.params

    const elemento = await svc.obtenerElementoCompetencia(id)
    if (!elemento) return res.status(404).json({ error: 'Elemento no encontrado.' })

    await svc.eliminarElementoCompetencia(id)
    await svc.reordenarElementosCompetencia(elemento.unidad_competencia_id)

    await registrarLog(buildLogFromReq(req, 'delete', 'elementos_competencia', id))

    res.json({ mensaje: 'Elemento de competencia eliminado exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarElementoCompetencia:', error.message)
    res.status(500).json({ error: 'Error al eliminar elemento de competencia.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIDADES DE APRENDIZAJE (Contenido Mínimo + Contenido Analítico)
// ═══════════════════════════════════════════════════════════════════════════

export async function listarUnidadesAprendizaje(req, res) {
  try {
    const uas = await svc.listarUnidadesAprendizaje(req.params.ucId)
    res.json(uas)
  } catch (error) {
    console.error('Error listarUnidadesAprendizaje:', error.message)
    res.status(500).json({ error: 'Error al listar unidades de aprendizaje.' })
  }
}

export async function crearUnidadAprendizaje(req, res) {
  try {
    const ucId = parseInt(req.params.ucId)
    const numero = await svc.siguienteNumeroUA(ucId)

    const data = {
      unidad_competencia_id: ucId,
      numero,
      titulo: req.body.titulo,
      contenido_analitico: req.body.contenido_analitico ?? null,
      horas: req.body.horas ?? null,
      orden: numero,
    }

    const nuevo = await svc.crearUnidadAprendizaje(data)

    await registrarLog(buildLogFromReq(req, 'create', 'unidades_aprendizaje', nuevo.id, {
      titulo: nuevo.titulo,
      unidad_competencia_id: ucId,
    }))

    res.status(201).json(nuevo)
  } catch (error) {
    console.error('Error crearUnidadAprendizaje:', error.message)
    res.status(500).json({ error: 'Error al crear unidad de aprendizaje.' })
  }
}

export async function actualizarUnidadAprendizaje(req, res) {
  try {
    const { id } = req.params
    const data = {}
    if (req.body.titulo !== undefined)              data.titulo = req.body.titulo
    if (req.body.contenido_analitico !== undefined) data.contenido_analitico = req.body.contenido_analitico
    if (req.body.horas !== undefined)               data.horas = req.body.horas

    const actualizado = await svc.actualizarUnidadAprendizaje(id, data)

    await registrarLog(buildLogFromReq(req, 'update', 'unidades_aprendizaje', id, { cambios: data }))

    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarUnidadAprendizaje:', error.message)
    res.status(500).json({ error: 'Error al actualizar unidad de aprendizaje.' })
  }
}

export async function eliminarUnidadAprendizaje(req, res) {
  try {
    const { id } = req.params

    const ua = await svc.obtenerUnidadAprendizaje(id)
    if (!ua) return res.status(404).json({ error: 'Unidad de aprendizaje no encontrada.' })

    await svc.eliminarUnidadAprendizaje(id)
    await svc.reordenarUnidadesAprendizaje(ua.unidad_competencia_id)

    await registrarLog(buildLogFromReq(req, 'delete', 'unidades_aprendizaje', id))

    res.json({ mensaje: 'Unidad de aprendizaje eliminada exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarUnidadAprendizaje:', error.message)
    res.status(500).json({ error: 'Error al eliminar unidad de aprendizaje.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENIDOS (Bibliografía)
// ═══════════════════════════════════════════════════════════════════════════

export async function listarContenidos(req, res) {
  try {
    const contenidos = await svc.listarContenidos(req.params.uaId)
    res.json(contenidos)
  } catch (error) {
    console.error('Error listarContenidos:', error.message)
    res.status(500).json({ error: 'Error al listar contenidos.' })
  }
}

export async function crearContenido(req, res) {
  try {
    const data = {
      unidad_aprendizaje_id: parseInt(req.params.uaId),
      tipo: req.body.tipo || 'Complementaria',
      contenido: req.body.contenido,
      orden: req.body.orden || 1,
    }

    const nuevo = await svc.crearContenido(data)

    await registrarLog(buildLogFromReq(req, 'create', 'contenidos', nuevo.id, {
      tipo: nuevo.tipo,
      unidad_aprendizaje_id: data.unidad_aprendizaje_id,
    }))

    res.status(201).json(nuevo)
  } catch (error) {
    console.error('Error crearContenido:', error.message)
    res.status(500).json({ error: 'Error al crear contenido.' })
  }
}

export async function actualizarContenido(req, res) {
  try {
    const { id } = req.params
    const data = {}
    if (req.body.tipo !== undefined)      data.tipo = req.body.tipo
    if (req.body.contenido !== undefined) data.contenido = req.body.contenido
    if (req.body.orden !== undefined)     data.orden = req.body.orden

    const actualizado = await svc.actualizarContenido(id, data)

    await registrarLog(buildLogFromReq(req, 'update', 'contenidos', id, { cambios: data }))

    res.json(actualizado)
  } catch (error) {
    console.error('Error actualizarContenido:', error.message)
    res.status(500).json({ error: 'Error al actualizar contenido.' })
  }
}

export async function eliminarContenido(req, res) {
  try {
    const { id } = req.params
    await svc.eliminarContenido(id)

    await registrarLog(buildLogFromReq(req, 'delete', 'contenidos', id))

    res.json({ mensaje: 'Contenido eliminado exitosamente.', id })
  } catch (error) {
    console.error('Error eliminarContenido:', error.message)
    res.status(500).json({ error: 'Error al eliminar contenido.' })
  }
}
