import axios from 'axios'
import { supabase } from './supabase'

/*
 * Cliente HTTP configurado para el backend de SISPLANECEME.
 *
 * - Base URL se lee de la variable de entorno VITE_API_URL.
 * - Interceptor que adjunta el token JWT de Supabase automáticamente.
 * - Si el backend responde 401, limpia la sesión y redirige al login.
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Interceptor de petición: adjuntar token ──────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Sin token — la petición seguirá sin Authorization
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Interceptor de respuesta: manejar errores ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response

      // Token expirado o inválido → redirigir (AuthContext maneja la limpieza)
      if (status === 401) {
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
      }

      // Devolver el mensaje del backend si existe
      const mensaje = error.response.data?.error || 'Error del servidor.'
      return Promise.reject(new Error(mensaje))
    }

    return Promise.reject(new Error('No se pudo conectar con el servidor.'))
  },
)

export default api
