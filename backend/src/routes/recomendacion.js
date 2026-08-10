import { Router } from 'express'
import { requirePermission } from '../middleware/permissions.js'
import * as ctrl from '../controllers/recomendacionControlador.js'

const router = Router()

// Datos base (docentes y UCs disponibles)
router.get('/datos', requirePermission('mallas:ver'), ctrl.listarDocentesYUCs)

// Recomendar docentes para una UC especifica
router.get('/docentes/:ucId', requirePermission('mallas:ver'), ctrl.recomendarParaUC)

// Recomendar UCs para un docente especifico
router.get('/ucs/:docenteId', requirePermission('mallas:ver'), ctrl.recomendarParaDocente)

// Matriz completa: todas las UCs con sus top-5 docentes
router.get('/matriz', requirePermission('mallas:ver'), ctrl.obtenerMatriz)

export default router
