import { body, validationResult } from 'express-validator'

/**
 * Middleware que verifica si hay errores de validación acumulados
 * y devuelve 400 con los detalles si los hay.
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos.',
      detalles: errors.array().map(e => ({ campo: e.path, mensaje: e.msg })),
    })
  }
  next()
}

// ─── Validadores de Mallas ────────────────────────────────────────────

export const mallaCreateRules = [
  body('year_start')
    .isInt({ min: 2020, max: 2100 }).withMessage('year_start debe ser un año válido (2020-2100).')
    .custom((v) => v % 2 === 0).withMessage('year_start debe ser un año par (2026, 2028, 2030...).'),
  body('nombre')
    .trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ max: 255 }).withMessage('Máximo 255 caracteres.'),
  body('descripcion')
    .optional().trim().isLength({ max: 500 }),
  body('estado')
    .optional().isIn(['activo', 'inactivo', 'borrador', 'archivado']).withMessage('Estado inválido.'),
]

// ─── Validadores de Ejes, Módulos, Unidades ──────────────────────────
// Nota: semestres y ejes son creados automáticamente por triggers en la BD.
// No exponemos validadores de creación para ellos.

export const moduloCreateRules = [
  body('codigo').trim().notEmpty().isLength({ max: 50 }),
  body('nombre').trim().notEmpty().isLength({ max: 500 }),
  body('competencia_general').optional({ nullable: true }).trim(),
  body('horas_teoricas').optional({ nullable: true }).isInt({ min: 0 }),
  body('horas_practicas').optional({ nullable: true }).isInt({ min: 0 }),
  body('horas_totales').optional({ nullable: true }).isInt({ min: 0 }),
  body('orden').optional({ nullable: true }).isInt({ min: 0 }),
]

export const contenidoCreateRules = [
  body('tipo').optional().trim().isLength({ max: 100 }),
  body('contenido').trim().notEmpty().withMessage('El contenido es requerido.'),
  body('orden').optional().isInt({ min: 1 }),
]

export const eventoUpdateRules = [
  body('titulo').optional().trim().isLength({ max: 255 }),
  body('fecha').optional().isISO8601().withMessage('fecha debe ser fecha ISO 8601.'),
  body('horas').optional().isInt({ min: 0 }),
  body('tipo').optional().trim().isLength({ max: 50 }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('unidad_competencia_id').optional({ nullable: true }).isInt({ min: 1 }),
]

export const unidadCompetenciaCreateRules = [
  body('modulo_id').isInt({ min: 1 }).withMessage('modulo_id es requerido.'),
  body('codigo').trim().notEmpty().isLength({ max: 50 }),
  body('nombre').trim().notEmpty().isLength({ max: 500 }),
  body('competencia_general').optional({ nullable: true }).trim(),
  body('dias').optional({ nullable: true }).isInt({ min: 0 }),
  body('horas_teoricas').optional({ nullable: true }).isInt({ min: 0 }),
  body('horas_practicas').optional({ nullable: true }).isInt({ min: 0 }),
  body('horas_totales').optional({ nullable: true }).isInt({ min: 0 }),
  body('orden').optional({ nullable: true }).isInt({ min: 0 }),
]

export const elementoCompetenciaCreateRules = [
  body('titulo').trim().notEmpty().withMessage('El título es requerido.').isLength({ max: 500 }),
  body('descripcion').optional({ nullable: true }).trim(),
]

export const unidadAprendizajeCreateRules = [
  body('titulo').trim().notEmpty().withMessage('El título es requerido.').isLength({ max: 500 }),
  body('contenido_analitico').optional({ nullable: true }).trim(),
  body('horas').optional({ nullable: true }).isInt({ min: 0 }),
  body('orden').optional({ nullable: true }).isInt({ min: 0 }),
]

// ─── Validadores de Usuarios ─────────────────────────────────────────

export const usuarioCreateRules = [
  body('ci')
    .notEmpty().withMessage('El CI es requerido.')
    .isLength({ max: 20 }),
  body('email')
    .optional().isEmail().withMessage('Email inválido.'),
  body('nombre')
    .trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ max: 255 }),
  body('apellidos')
    .trim().notEmpty().withMessage('Los apellidos son requeridos.')
    .isLength({ max: 255 }),
  body('grado')
    .optional().trim().isLength({ max: 50 }),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
]

export const asignarRolRules = [
  body('rol_id')
    .isInt({ min: 1 }).withMessage('rol_id debe ser un entero positivo.'),
]

export const cambiarEstadoRules = [
  body('activo')
    .isBoolean().withMessage('activo debe ser true o false.'),
]

// ─── Validadores de Calendario ────────────────────────────────────────

export const eventoCreateRules = [
  body('titulo').trim().notEmpty().isLength({ max: 255 }),
  body('fecha').isISO8601().withMessage('fecha debe ser fecha ISO 8601.'),
  body('horas').optional().isInt({ min: 0 }),
  body('tipo').optional().trim().isLength({ max: 50 }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('semestre_id')
    .notEmpty().withMessage('semestre_id es requerido.')
    .isInt({ min: 1 }),
  body('unidad_competencia_id').optional({ nullable: true }).isInt({ min: 1 }),
]

// ─── Validadores de Roles ─────────────────────────────────────────────

export const rolCreateRules = [
  body('nombre')
    .trim().notEmpty().withMessage('El nombre del rol es requerido.')
    .isLength({ max: 100 }),
  body('descripcion')
    .optional().trim().isLength({ max: 500 }),
]
