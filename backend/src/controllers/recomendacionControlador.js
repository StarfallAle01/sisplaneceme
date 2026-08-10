import * as svc from '../models/supabaseModelo.js'
import { recomendarDocentesParaUC, recomendarUCsParaDocente, generarMatrizCompleta } from '../services/recomendacionEngine.js'
import { MOCK_DOCENTES, MOCK_UCS } from '../data/mockRecomendaciones.js'

async function cargarDatos() {
  const todasLasUCs = []

  const usuarios = await svc.listarUsuarios()
  const docentes = usuarios.filter(u => {
    const roles = u.roles || []
    return roles.some(r => (r.nombre || r) === 'profesor')
  })

  const mallas = await svc.listarMallas()
  const activa = mallas.find(m => m.estado === 'activo') || mallas[0]

  if (activa) {
    const arbol = await svc.obtenerMallaCompleta(activa.id)
    ;(arbol || []).forEach(sem => {
      ;(sem.ejes_curriculares || []).forEach(eje => {
        ;(eje.modulos || []).forEach(mod => {
          ;(mod.unidades_competencia || []).forEach(uc => todasLasUCs.push(uc))
        })
      })
      if (sem.transversales) {
        const tx = Array.isArray(sem.transversales) ? sem.transversales : [sem.transversales]
        tx.forEach(t => (t.unidades_competencia || []).forEach(uc => todasLasUCs.push(uc)))
      }
    })
  }

  // Si la DB no tiene datos suficientes, usar datos de demostración
  const usandoDemo = docentes.length === 0 || todasLasUCs.length === 0
  if (usandoDemo) {
    return {
      docentes: MOCK_DOCENTES,
      ucs: MOCK_UCS,
      _demo: true,
    }
  }

  return { docentes, ucs: todasLasUCs, _demo: false }
}

export async function recomendarParaUC(req, res) {
  try {
    const { ucId } = req.params
    const { docentes, ucs, _demo } = await cargarDatos()
    const resultado = recomendarDocentesParaUC(docentes, ucs, parseInt(ucId))
    res.json({ recomendaciones: resultado, _demo })
  } catch (error) {
    console.error('Error recomendarParaUC:', error.message)
    res.status(500).json({ error: 'Error al generar recomendaciones.' })
  }
}

export async function recomendarParaDocente(req, res) {
  try {
    const { docenteId } = req.params
    const { docentes, ucs, _demo } = await cargarDatos()
    const resultado = recomendarUCsParaDocente(docentes, ucs, docenteId)
    res.json({ recomendaciones: resultado, _demo })
  } catch (error) {
    console.error('Error recomendarParaDocente:', error.message)
    res.status(500).json({ error: 'Error al generar recomendaciones.' })
  }
}

export async function obtenerMatriz(req, res) {
  try {
    const { docentes, ucs, _demo } = await cargarDatos()
    const matriz = generarMatrizCompleta(docentes, ucs)
    res.json({ matriz, _demo })
  } catch (error) {
    console.error('Error obtenerMatriz:', error.message)
    res.status(500).json({ error: 'Error al generar matriz de recomendaciones.' })
  }
}

export async function listarDocentesYUCs(req, res) {
  try {
    const { docentes, ucs, _demo } = await cargarDatos()
    res.json({
      docentes: docentes.map(d => ({ id: d.id, nombre: d.nombre, apellidos: d.apellidos, grado: d.grado })),
      ucs: ucs.map(u => ({ id: u.id, codigo: u.codigo, nombre: u.nombre })),
      _demo,
    })
  } catch (error) {
    console.error('Error listarDocentesYUCs:', error.message)
    res.status(500).json({ error: 'Error al cargar datos.' })
  }
}
