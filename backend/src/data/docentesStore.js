import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'docentes_profiles.json')

function leerPerfiles() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
      return []
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function guardarPerfiles(perfiles) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(perfiles, null, 2), 'utf-8')
}

export function obtenerPerfil(usuarioId) {
  const perfiles = leerPerfiles()
  return perfiles.find(p => p.usuario_id === usuarioId) || null
}

export function guardarPerfil(usuarioId, datos) {
  const perfiles = leerPerfiles()
  const idx = perfiles.findIndex(p => p.usuario_id === usuarioId)

  const perfil = {
    usuario_id: usuarioId,
    especialidad: datos.especialidad || '',
    area: datos.area || '',
    descripcion: datos.descripcion || '',
    experiencia_laboral: datos.experiencia_laboral || '',
    cursos_realizados: datos.cursos_realizados || '',
    justificantes: datos.justificantes || [],
    actualizado_en: new Date().toISOString(),
  }

  if (idx >= 0) {
    perfiles[idx] = { ...perfiles[idx], ...perfil }
  } else {
    perfiles.push(perfil)
  }

  guardarPerfiles(perfiles)
  return perfiles[idx >= 0 ? idx : perfiles.length - 1]
}

export function agregarJustificante(usuarioId, archivo) {
  const perfiles = leerPerfiles()
  const idx = perfiles.findIndex(p => p.usuario_id === usuarioId)

  const justificante = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    nombre_original: archivo.originalname,
    nombre_archivo: archivo.filename,
    ruta: `/uploads/${archivo.filename}`,
    tamaño: archivo.size,
    tipo: archivo.mimetype,
    subido_en: new Date().toISOString(),
  }

  if (idx >= 0) {
    if (!perfiles[idx].justificantes) perfiles[idx].justificantes = []
    perfiles[idx].justificantes.push(justificante)
    perfiles[idx].actualizado_en = new Date().toISOString()
  } else {
    perfiles.push({
      usuario_id: usuarioId,
      especialidad: '',
      area: '',
      descripcion: '',
      experiencia_laboral: '',
      cursos_realizados: '',
      justificantes: [justificante],
      actualizado_en: new Date().toISOString(),
    })
  }

  guardarPerfiles(perfiles)
  return justificante
}

export function eliminarJustificante(usuarioId, justificanteId) {
  const perfiles = leerPerfiles()
  const idx = perfiles.findIndex(p => p.usuario_id === usuarioId)
  if (idx < 0) return null

  const perfil = perfiles[idx]
  const justificante = perfil.justificantes?.find(j => j.id === justificanteId)
  if (!justificante) return null

  const filePath = path.join(__dirname, '..', '..', 'uploads', justificante.nombre_archivo)
  try { fs.unlinkSync(filePath) } catch {}

  perfil.justificantes = perfil.justificantes.filter(j => j.id !== justificanteId)
  perfil.actualizado_en = new Date().toISOString()
  guardarPerfiles(perfiles)
  return { eliminado: justificanteId }
}

export function listarTodosPerfiles() {
  return leerPerfiles()
}
