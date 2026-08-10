import { Router } from 'express'
import { getMe } from '../controllers/authControlador.js'

const router = Router()

/**
 * GET /api/auth/me
 * Devuelve el usuario autenticado con sus roles y permisos.
 * Protegida: requiere token JWT válido (middleware global de autenticación).
 */
router.get('/me', getMe)

export default router
