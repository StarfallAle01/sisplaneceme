import { Router } from 'express'
import { requirePermission } from '../middleware/permissions.js'
import { rolCreateRules, handleValidationErrors } from '../utils/validadores.js'
import * as ctrl from '../controllers/rolesControlador.js'

const router = Router()

/**
 * GET /api/roles
 * Lista todos los roles con sus permisos.
 * Solo super_admin.
 */
router.get('/', requirePermission('roles:admin'), ctrl.listarRoles)

/**
 * POST /api/roles
 * Crea un nuevo rol.
 * Solo super_admin.
 */
router.post('/',
  requirePermission('roles:admin'),
  rolCreateRules, handleValidationErrors,
  ctrl.crearRol,
)

/**
 * PUT /api/roles/:id
 * Actualiza un rol existente.
 * Solo super_admin.
 */
router.put('/:id', requirePermission('roles:admin'), ctrl.actualizarRol)

/**
 * DELETE /api/roles/:id
 * Elimina un rol.
 * Solo super_admin.
 */
router.delete('/:id', requirePermission('roles:admin'), ctrl.eliminarRol)

/**
 * POST /api/roles/:id/permisos
 * Asigna un permiso a un rol.
 * Solo super_admin.
 */
router.post('/:id/permisos', requirePermission('roles:admin'), ctrl.asignarPermisoRol)

/**
 * DELETE /api/roles/:id/permisos/:permisoId
 * Quita un permiso de un rol.
 * Solo super_admin.
 */
router.delete('/:id/permisos/:permisoId', requirePermission('roles:admin'), ctrl.quitarPermisoRol)

/**
 * GET /api/roles/permisos
 * Lista todos los permisos disponibles.
 * Solo super_admin.
 */
router.get('/permisos', requirePermission('roles:admin'), ctrl.listarPermisos)

export default router
