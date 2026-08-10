import { Router } from 'express'
import { requirePermission } from '../middleware/permissions.js'
import { usuarioCreateRules, asignarRolRules, cambiarEstadoRules, handleValidationErrors } from '../utils/validadores.js'
import * as ctrl from '../controllers/usuariosControlador.js'

const router = Router()

/**
 * GET /api/usuarios
 * Lista todos los usuarios con sus roles.
 * Solo admin y super_admin.
 */
router.get('/', requirePermission('usuarios:ver'), ctrl.listarUsuarios)

/**
 * POST /api/usuarios
 * Crea un nuevo usuario.
 * Solo admin y super_admin.
 */
router.post('/',
  requirePermission('usuarios:crear'),
  usuarioCreateRules, handleValidationErrors,
  ctrl.crearUsuario,
)

/**
 * PUT /api/usuarios/:id
 * Actualiza los datos de un usuario.
 * Solo admin y super_admin.
 */
router.put('/:id', requirePermission('usuarios:editar'), ctrl.actualizarUsuario)

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario. Solo super_admin.
 */
router.delete('/:id', requirePermission('usuarios:eliminar'), ctrl.eliminarUsuario)

/**
 * POST /api/usuarios/:id/roles
 * Asigna un rol a un usuario.
 * Solo super_admin.
 */
router.post('/:id/roles',
  requirePermission('usuarios:editar'),
  asignarRolRules, handleValidationErrors,
  ctrl.asignarRol,
)

/**
 * DELETE /api/usuarios/:id/roles/:rolId
 * Quita un rol a un usuario.
 * Solo super_admin.
 */
router.delete('/:id/roles/:rolId', requirePermission('usuarios:eliminar'), ctrl.quitarRol)

/**
 * PATCH /api/usuarios/:id/estado
 * Activa/desactiva un usuario.
 * Solo super_admin y admin.
 */
router.patch('/:id/estado',
  requirePermission('usuarios:editar'),
  cambiarEstadoRules, handleValidationErrors,
  ctrl.cambiarEstado,
)

export default router
