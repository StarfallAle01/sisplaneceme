/**
 * GET /api/auth/me
 * Devuelve el usuario autenticado con sus roles y permisos.
 * Requiere middleware auth.js previo.
 */
export async function getMe(req, res) {
  try {
    const user = req.user
    res.json({
      id: user.id,
      email: user.email,
      ci: user.ci,
      nombre: user.nombre,
      grado: user.grado,
      roles: user.roles,
      permisos: user.permisos,
    })
  } catch (error) {
    console.error('Error en getMe:', error.message)
    res.status(500).json({ error: 'Error al obtener datos del usuario.' })
  }
}
