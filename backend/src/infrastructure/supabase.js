import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Variables SUPABASE_URL y SUPABASE_ANON_KEY son requeridas.')
  process.exit(1)
}

/*
 * Cliente anónimo:
 * Se usa para autenticar usuarios (signInWithPassword, getUser) y para
 * operaciones donde pasamos el JWT del usuario en cada consulta.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
 * Cliente admin (service_role):
 * Se usa SOLO si se configuró SUPABASE_SERVICE_ROLE_KEY.
 * Permite consultas que ignoran RLS. Usar con cuidado.
 */
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null

/**
 * Obtiene un cliente de Supabase autenticado con el access_token del usuario.
 * Útil para consultas que respetan RLS a nivel de base de datos.
 */
export function getAuthenticatedClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

/**
 * Cliente para operaciones de servicio (admin).
 * Si no hay service role key, lanza un error.
 */
export function getAdminClient() {
  if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada. No se puede usar el cliente admin.')
  }
  return supabaseAdmin
}
