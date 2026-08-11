import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

// ─── Configuración inicial ────────────────────────────────────────────
dotenv.config()

import authMiddleware from './middleware/auth.js'
import { requestLogger } from './middleware/logger.js'

import authRoutes       from './routes/auth.js'
import mallasRoutes     from './routes/mallas.js'
import usuariosRoutes   from './routes/usuarios.js'
import calendarioRoutes from './routes/calendario.js'
import logsRoutes       from './routes/logs.js'
import rolesRoutes      from './routes/roles.js'
import recomendacionRoutes from './routes/recomendacion.js'
import docentesRoutes   from './routes/docentes.js'

const app = express()
const PORT = process.env.PORT || 3000

// ─── Middlewares globales ─────────────────────────────────────────────

// Log de cada petición
app.use(requestLogger)

// Headers de seguridad HTTP
app.use(helmet())

// Compresión gzip/deflate para respuestas
app.use(compression())

// CORS: permitir solo el frontend configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// Parsear JSON
app.use(express.json())

// ─── Archivos estáticos (PDFs, etc.) ─────────────────────────────────
app.use('/uploads', express.static('uploads'))

// ─── Ruta de health check (sin autenticación) ────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// ─── Rate limiting para endpoints de la API ─────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                   // máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intente de nuevo en 15 minutos.' },
})

// ─── Rutas públicas ───────────────────────────────────────────────────
// (De momento, todas requieren auth. La autenticación real de login
//  ocurre en el frontend vía Supabase directamente.)

// ─── Middleware de autenticación ──────────────────────────────────────
// Todas las rutas debajo de esta línea requieren token JWT válido
app.use('/api', apiLimiter)
app.use('/api', authMiddleware)

// ─── Rutas protegidas ─────────────────────────────────────────────────

app.use('/api/auth',       authRoutes)
app.use('/api/mallas',     mallasRoutes)
app.use('/api/usuarios',   usuariosRoutes)
app.use('/api/calendario', calendarioRoutes)
app.use('/api/logs',       logsRoutes)
app.use('/api/roles',      rolesRoutes)
app.use('/api/recomendaciones', recomendacionRoutes)
app.use('/api/docentes',   docentesRoutes)

// ─── 404 para rutas no encontradas ────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado.' })
})

// ─── Manejo global de errores ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Error no manejado:', err)
  res.status(500).json({
    error: 'Error interno del servidor.',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// ─── Red de seguridad del proceso ─────────────────────────────────────
// Evita que un error asíncrono no capturado tumbe el servidor (lo que
// dejaría las peticiones en curso sin respuesta: "No se pudo conectar").
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Promesa rechazada no manejada:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('⚠️  Excepción no capturada — terminando proceso:', err)
  process.exit(1)
})

// ─── Iniciar servidor ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║        ECEME Planning API — Backend v1.0            ║')
  console.log(`║        Servidor corriendo en puerto ${PORT}             ║`)
  console.log(`║        Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(35)}║`)
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('')
  console.log('📋 Endpoints disponibles:')
  console.log(`   GET  http://localhost:${PORT}/api/health`)
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`)
  console.log(`   ...  http://localhost:${PORT}/api/mallas`)
  console.log(`   ...  http://localhost:${PORT}/api/usuarios`)
  console.log(`   ...  http://localhost:${PORT}/api/calendario`)
  console.log(`   ...  http://localhost:${PORT}/api/logs`)
  console.log('')
})

export default app
