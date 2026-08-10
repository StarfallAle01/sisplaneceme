// ═══════════════════════════════════════════════════════════════════════
// MOTOR DE RECOMENDACIÓN — TF-IDF + Similitud de Coseno
// Content-Based Recommendation System
// ═══════════════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'e',
  'o', 'a', 'en', 'con', 'por', 'para', 'del', 'al', 'se', 'su', 'es',
  'que', 'no', 'lo', 'como', 'entre', 'hacia', 'hasta', 'desde', 'sin',
  'sobre', 'tras', 'durante', 'mediante', 'pero', 'más', 'muy', 'tan',
  'también', 'además', 'así', 'solo', 'ya', 'si', 'todo', 'cada',
  'sus', 'le', 'les', 'ha', 'han', 'ser', 'son', 'está', 'están',
  'daen', 'dem', 'cab', 'art', 'com', 'ing',
])

function tokenizar(texto) {
  if (!texto) return []
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9áéíóúñ ]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t))
}

function calcularTF(documento) {
  const tokens = tokenizar(documento)
  if (tokens.length === 0) return {}
  const tf = {}
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1 })
  const total = tokens.length
  for (const t in tf) tf[t] /= total
  return tf
}

function calcularIDF(documentos) {
  const idf = {}
  const N = documentos.length
  if (N === 0) return idf
  documentos.forEach(doc => {
    const tokens = new Set(tokenizar(doc))
    tokens.forEach(t => { idf[t] = (idf[t] || 0) + 1 })
  })
  for (const t in idf) {
    idf[t] = Math.log((N + 1) / (idf[t] + 1)) + 1
  }
  return idf
}

function vectorTFIDF(documento, idf) {
  const tf = calcularTF(documento)
  const vec = {}
  const allTerms = new Set([...Object.keys(tf), ...Object.keys(idf)])
  allTerms.forEach(t => {
    vec[t] = (tf[t] || 0) * (idf[t] || 0)
  })
  return vec
}

function similitudCoseno(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)])
  let dot = 0, magA = 0, magB = 0
  keys.forEach(k => {
    const a = vecA[k] || 0
    const b = vecB[k] || 0
    dot += a * b
    magA += a * a
    magB += b * b
  })
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

// Mapeo de grado militar a área de conocimiento dominante
const GRADO_AREA = {
  'CNL.':   'comandante liderazgo estrategia mando operaciones planificacion',
  'TCNL.':  'liderazgo tactica operaciones mando planificacion',
  'MAYOR':  'tactica operaciones logistica administracion planificacion',
  'CAP.':   'tactica operaciones administracion instruccion',
  'TTE.':   'instruccion operaciones basico',
  'SGTO.':  'instruccion administracion basico',
  'CRL.':   'comandante liderazgo estrategia mando operaciones planificacion',
}

function expandirGrado(grado) {
  if (!grado) return ''
  const g = grado.toUpperCase().trim()
  for (const key of Object.keys(GRADO_AREA)) {
    if (g.startsWith(key)) return GRADO_AREA[key]
  }
  return ''
}

function construirPerfilDocente(docente) {
  const partes = []
  if (docente.especialidad) partes.push(docente.especialidad)
  if (docente.area) partes.push(docente.area)
  if (docente.descripcion) partes.push(docente.descripcion)
  // Expandir el grado a keywords de dominio
  const areaGrado = expandirGrado(docente.grado)
  if (areaGrado) partes.push(areaGrado)
  // Nombre completo como señal de identidad (baja relevancia)
  if (docente.nombre) partes.push(docente.nombre)
  if (docente.apellidos) partes.push(docente.apellidos)
  return partes.join(' ')
}

function construirPerfilUC(uc) {
  const partes = []
  if (uc.nombre) partes.push(uc.nombre)
  if (uc.competencia_general) partes.push(uc.competencia_general)
  if (uc.descripcion) partes.push(uc.descripcion)
  // El código como referencia (menor peso semántico)
  if (uc.codigo) partes.push(uc.codigo)
  return partes.join(' ')
}

export function recomendarDocentesParaUC(docentes, ucs, ucId) {
  const uc = ucs.find(u => String(u.id) === String(ucId))
  if (!uc) return []

  const perfilUC = construirPerfilUC(uc)
  const perfilesDocentes = docentes.map(d => construirPerfilDocente(d))
  const todosLosDocs = [perfilUC, ...perfilesDocentes]
  const idf = calcularIDF(todosLosDocs)
  const vecUC = vectorTFIDF(perfilUC, idf)

  const resultados = docentes.map((doc, i) => {
    const vecDoc = vectorTFIDF(perfilesDocentes[i], idf)
    const score = similitudCoseno(vecUC, vecDoc)
    return { docente: doc, score: Math.round(score * 10000) / 100 }
  })

  return resultados
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

export function recomendarUCsParaDocente(docentes, ucs, docenteId) {
  const docente = docentes.find(d => String(d.id) === String(docenteId))
  if (!docente) return []

  const perfilDoc = construirPerfilDocente(docente)
  const perfilesUCs = ucs.map(uc => construirPerfilUC(uc))
  const todosLosDocs = [perfilDoc, ...perfilesUCs]
  const idf = calcularIDF(todosLosDocs)
  const vecDoc = vectorTFIDF(perfilDoc, idf)

  const resultados = ucs.map((uc, i) => {
    const vecUC = vectorTFIDF(perfilesUCs[i], idf)
    const score = similitudCoseno(vecDoc, vecUC)
    return { uc, score: Math.round(score * 10000) / 100 }
  })

  return resultados
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

export function generarMatrizCompleta(docentes, ucs) {
  const perfilesDoc = docentes.map(d => construirPerfilDocente(d))
  const perfilesUC = ucs.map(uc => construirPerfilUC(uc))
  const todosLosDocs = [...perfilesDoc, ...perfilesUC]
  const idf = calcularIDF(todosLosDocs)

  const vecsDoc = perfilesDoc.map(p => vectorTFIDF(p, idf))
  const vecsUC = perfilesUC.map(p => vectorTFIDF(p, idf))

  return ucs.map((uc, i) => {
    const resultados = docentes.map((doc, j) => ({
      docente: doc,
      score: Math.round(similitudCoseno(vecsUC[i], vecsDoc[j]) * 10000) / 100,
    }))
    return {
      uc,
      recomendaciones: resultados
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    }
  })
}
