import { Router } from 'express'
import { requirePermission } from '../middleware/permissions.js'
import {
  handleValidationErrors,
  mallaCreateRules,
  moduloCreateRules,
  unidadCompetenciaCreateRules,
  elementoCompetenciaCreateRules,
  unidadAprendizajeCreateRules,
  contenidoCreateRules,
} from '../utils/validadores.js'
import * as ctrl from '../controllers/mallasControlador.js'

const router = Router()

// ─── MALLAS ───────────────────────────────────────────────────────────

router.get('/', requirePermission('mallas:ver'), ctrl.listarMallas)

router.post('/',
  requirePermission('mallas:crear'),
  mallaCreateRules, handleValidationErrors,
  ctrl.crearMalla,
)

// Rutas literales DEBEN ir antes de wildcards /:id
router.get('/unidades-competencia', requirePermission('mallas:ver'), ctrl.listarUnidadesCompetencia)

router.get('/:id', requirePermission('mallas:ver'), ctrl.obtenerMalla)
router.get('/:id/completa', requirePermission('mallas:ver'), ctrl.obtenerMallaCompleta)

router.put('/:id', requirePermission('mallas:editar'), ctrl.actualizarMalla)
router.delete('/:id', requirePermission('mallas:eliminar'), ctrl.eliminarMalla)

// ─── SEMESTRES (sólo lectura — creados por trigger) ───────────────────

router.get('/:mallaId/semestres', requirePermission('mallas:ver'), ctrl.listarSemestres)
router.get('/semestres/:id', requirePermission('mallas:ver'), ctrl.obtenerSemestre)

// ─── EJES CURRICULARES (sólo lectura + edición limitada) ──────────────

router.get('/semestres/:semestreId/ejes', requirePermission('mallas:ver'), ctrl.listarEjes)
router.get('/ejes/:id', requirePermission('mallas:ver'), ctrl.obtenerEje)
router.put('/ejes/:id', requirePermission('mallas:editar'), ctrl.actualizarEje)

// ─── MÓDULOS (CRUD para ejes académicos) ──────────────────────────────

router.get('/ejes/:ejeId/modulos', requirePermission('mallas:ver'), ctrl.listarModulos)

router.post('/ejes/:ejeId/modulos',
  requirePermission('mallas:crear'),
  moduloCreateRules, handleValidationErrors,
  ctrl.crearModulo,
)

router.put('/modulos/:id', requirePermission('mallas:editar'), ctrl.actualizarModulo)
router.delete('/modulos/:id', requirePermission('mallas:eliminar'), ctrl.eliminarModulo)

// ─── UNIDADES DE COMPETENCIA ──────────────────────────────────────────

router.get('/modulos/:moduloId/unidades-competencia', requirePermission('mallas:ver'), ctrl.listarUCsPorModulo)

router.post('/unidades-competencia',
  requirePermission('mallas:crear'),
  unidadCompetenciaCreateRules, handleValidationErrors,
  ctrl.crearUnidadCompetencia,
)

router.get('/unidades-competencia/:id', requirePermission('mallas:ver'), ctrl.obtenerUnidadCompetencia)
router.put('/unidades-competencia/:id', requirePermission('mallas:editar'), ctrl.actualizarUnidadCompetencia)
router.delete('/unidades-competencia/:id', requirePermission('mallas:eliminar'), ctrl.eliminarUnidadCompetencia)

// ─── ELEMENTOS DE COMPETENCIA ─────────────────────────────────────────

router.get('/unidades-competencia/:ucId/elementos', requirePermission('mallas:ver'), ctrl.listarElementosCompetencia)

router.post('/unidades-competencia/:ucId/elementos',
  requirePermission('mallas:crear'),
  elementoCompetenciaCreateRules, handleValidationErrors,
  ctrl.crearElementoCompetencia,
)

router.put('/elementos/:id', requirePermission('mallas:editar'), ctrl.actualizarElementoCompetencia)
router.delete('/elementos/:id', requirePermission('mallas:eliminar'), ctrl.eliminarElementoCompetencia)

// ─── UNIDADES DE APRENDIZAJE (Contenido Mínimo + Analítico) ───────────

router.get('/unidades-competencia/:ucId/aprendizaje', requirePermission('mallas:ver'), ctrl.listarUnidadesAprendizaje)

router.post('/unidades-competencia/:ucId/aprendizaje',
  requirePermission('mallas:crear'),
  unidadAprendizajeCreateRules, handleValidationErrors,
  ctrl.crearUnidadAprendizaje,
)

router.put('/unidades-aprendizaje/:id', requirePermission('mallas:editar'), ctrl.actualizarUnidadAprendizaje)
router.delete('/unidades-aprendizaje/:id', requirePermission('mallas:eliminar'), ctrl.eliminarUnidadAprendizaje)

// ─── CONTENIDOS (bibliografía) ────────────────────────────────────────

router.get('/unidades-aprendizaje/:uaId/contenidos', requirePermission('mallas:ver'), ctrl.listarContenidos)
router.post('/unidades-aprendizaje/:uaId/contenidos',
  requirePermission('mallas:crear'),
  contenidoCreateRules, handleValidationErrors,
  ctrl.crearContenido,
)
router.put('/contenidos/:id',
  requirePermission('mallas:editar'),
  contenidoCreateRules, handleValidationErrors,
  ctrl.actualizarContenido,
)
router.delete('/contenidos/:id', requirePermission('mallas:eliminar'), ctrl.eliminarContenido)

export default router
