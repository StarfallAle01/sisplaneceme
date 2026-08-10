import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { requirePermission } from '../middleware/permissions.js'
import * as ctrl from '../controllers/docentesControlador.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, unique + ext)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos PDF.'))
    }
  },
})

const router = Router()

router.get('/', requirePermission('mallas:ver'), ctrl.listarDocentes)
router.get('/:id/perfil', requirePermission('mallas:ver'), ctrl.obtenerPerfilDocente)
router.put('/:id/perfil', requirePermission('mallas:ver'), ctrl.guardarPerfilDocente)

router.post('/:id/justificantes',
  requirePermission('mallas:ver'),
  upload.single('archivo'),
  ctrl.subirJustificante,
)

router.delete('/:id/justificantes/:justificanteId',
  requirePermission('mallas:ver'),
  ctrl.eliminarJustificante,
)

export default router
