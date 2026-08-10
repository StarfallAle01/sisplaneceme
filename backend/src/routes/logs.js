import { Router } from 'express'
import { requirePermission } from '../middleware/permissions.js'
import * as ctrl from '../controllers/logsControlador.js'

const router = Router()

/**
 * GET /api/logs
 * Lista logs del sistema con filtros opcionales.
 * Solo admin y super_admin.
 */
router.get('/', requirePermission('logs:ver'), ctrl.listarLogs)

export default router
