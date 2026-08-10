import * as store from '../data/docentesStore.js'
import * as svc from '../models/supabaseModelo.js'

export async function listarDocentes(req, res) {
  try {
    const usuarios = await svc.listarUsuarios()
    const docentes = usuarios.filter(u => {
      const roles = u.roles || []
      return roles.some(r => (r.nombre || r) === 'profesor')
    })

    const perfiles = store.listarTodosPerfiles()

    const resultado = docentes.map(d => {
      const perfil = perfiles.find(p => p.usuario_id === d.id)
      return {
        id: d.id,
        ci: d.ci,
        email: d.email,
        nombre: d.nombre,
        apellidos: d.apellidos,
        grado: d.grado,
        activo: d.activo,
        perfil: perfil ? {
          especialidad: perfil.especialidad,
          area: perfil.area,
          descripcion: perfil.descripcion,
          experiencia_laboral: perfil.experiencia_laboral,
          cursos_realizados: perfil.cursos_realizados,
          justificantes: perfil.justificantes || [],
          actualizado_en: perfil.actualizado_en,
        } : null,
      }
    })

    res.json(resultado)
  } catch (error) {
    console.error('Error listarDocentes:', error.message)
    res.status(500).json({ error: 'Error al listar docentes.' })
  }
}

export async function obtenerPerfilDocente(req, res) {
  try {
    const perfil = store.obtenerPerfil(req.params.id)
    if (!perfil) {
      return res.json({
        usuario_id: req.params.id,
        especialidad: '',
        area: '',
        descripcion: '',
        experiencia_laboral: '',
        cursos_realizados: '',
        justificantes: [],
      })
    }
    res.json(perfil)
  } catch (error) {
    console.error('Error obtenerPerfilDocente:', error.message)
    res.status(500).json({ error: 'Error al obtener perfil.' })
  }
}

export async function guardarPerfilDocente(req, res) {
  try {
    const usuarioId = req.params.id
    const datos = {
      especialidad: req.body.especialidad,
      area: req.body.area,
      descripcion: req.body.descripcion,
      experiencia_laboral: req.body.experiencia_laboral,
      cursos_realizados: req.body.cursos_realizados,
    }

    const perfil = store.guardarPerfil(usuarioId, datos)
    res.json(perfil)
  } catch (error) {
    console.error('Error guardarPerfilDocente:', error.message)
    res.status(500).json({ error: 'Error al guardar perfil.' })
  }
}

export async function subirJustificante(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' })
    }

    const justificante = store.agregarJustificante(req.params.id, req.file)
    res.status(201).json(justificante)
  } catch (error) {
    console.error('Error subirJustificante:', error.message)
    res.status(500).json({ error: 'Error al subir justificante.' })
  }
}

export async function eliminarJustificante(req, res) {
  try {
    const resultado = store.eliminarJustificante(req.params.id, req.params.justificanteId)
    if (!resultado) {
      return res.status(404).json({ error: 'Justificante no encontrado.' })
    }
    res.json({ mensaje: 'Justificante eliminado.', ...resultado })
  } catch (error) {
    console.error('Error eliminarJustificante:', error.message)
    res.status(500).json({ error: 'Error al eliminar justificante.' })
  }
}
