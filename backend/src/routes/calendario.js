import { Router } from 'express'
import { requirePermission } from '../middleware/permissions.js'
import { eventoCreateRules, eventoUpdateRules, handleValidationErrors } from '../utils/validadores.js'
import * as ctrl from '../controllers/calendarioControlador.js'

const router = Router()

// Ver: todos los roles con permiso
router.get('/', requirePermission('calendario:ver'), ctrl.listarEventos)

// Crear en lote: debe ir ANTES de /:id para que Express no interprete "lote" como un id
router.post('/lote', requirePermission('calendario:crear'), ctrl.crearEventosLote)

// Crear: admin, super_admin
router.post('/',
  requirePermission('calendario:crear'),
  eventoCreateRules, handleValidationErrors,
  ctrl.crearEvento,
)

// Actualizar: admin, super_admin
router.put('/:id',
  requirePermission('calendario:editar'),
  eventoUpdateRules, handleValidationErrors,
  ctrl.actualizarEvento,
)

// Eliminar: admin, super_admin
router.delete('/:id', requirePermission('calendario:eliminar'), ctrl.eliminarEvento)

export default router
