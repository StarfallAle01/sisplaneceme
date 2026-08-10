// ─────────────────────────────────────────────────────────────────────────
// Contenido editable de la Landing Page (página de presentación pública).
//
// Estos datos NO viven en la base de datos: son puramente de presentación.
// El módulo de administración "Presentación" permite editarlos desde la
// interfaz y los guarda en localStorage. La landing (Inicio.jsx) los lee
// mediante `cargarPresentacion()`, combinando los valores guardados con
// estos valores por defecto.
// ─────────────────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'sisplaneceme_presentacion'

export const PRESENTACION_DEFAULT = {
  header: {
    eyebrow: 'FF.AA. Bolivia · 2026',
    institucion: 'Escuela de Comando y Estado Mayor del Ejército',
  },
  hero: {
    titulo: 'Postgrado ECEME',
    subtitulo: 'Diplomado de Comando y Estado Mayor del Ejército',
    descripcion:
      'Formación de líderes militares con competencias estratégicas y doctrinarias para la Seguridad, Defensa y Desarrollo del Estado Plurinacional de Bolivia.',
    lema: 'Dios · Patria · Hogar',
  },
  programa: {
    parrafos: [
      'La Educación Militar del Ejército es un sistema basado en principios que se complementan con un conjunto de valores éticos, morales, cívicos, sociales, operativos, doctrinarios y culturales, con la finalidad de desarrollar habilidades, capacidades y destrezas para cumplir la misión constitucional.',
      'El Plan de Estudios de la ECEME responde al Diseño Curricular 2022–2026, bajo el Modelo Educativo por Competencias, sustentado en la Ley N° 070 "Avelino Siñani - Elizardo Pérez" y el Sistema Educativo de las Fuerzas Armadas (SEFA).',
      'El programa forma Oficiales Superiores con las competencias necesarias para desempeñar funciones de Comando y Estado Mayor en los diferentes niveles de la organización militar, integrando conocimiento académico, doctrina operativa y valores institucionales.',
    ],
    fundamentos: [
      'Diseño Curricular 2022–2026',
      'Ley N° 070 "Avelino Siñani - Elizardo Pérez"',
      'Sistema Educativo de las FF.AA. (SEFA)',
      'Universidad Militar (UNIMIL)',
      'Modelo Educativo por Competencias',
    ],
  },
  pilares: [
    {
      title: 'Formación Académica',
      body: 'Referida a impartir en la formación militar la transferencia de conocimientos, habilidades y destrezas basados en la doctrina vigente y métodos científicos como elementos eficaces para la Seguridad, Defensa y Desarrollo del Estado.',
    },
    {
      title: 'Formación Disciplinaria',
      body: 'El Cursante tendrá los conocimientos para desarrollar funciones enmarcado en las leyes nacionales, tratados internacionales, legislación militar, resoluciones, reglamentos, directivas y órdenes.',
    },
    {
      title: 'Entrenamiento Físico Militar',
      body: 'Permite el cumplimiento de su misión enmarcada en la Defensa del Estado, a través del desarrollo de habilidades y destrezas mediante la práctica sistemática de actividades físicas aplicadas a la Ciencia y al Arte Militar.',
    },
  ],
  vision:
    'Ser la institución líder en la formación de oficiales de Estado Mayor, reconocida por su excelencia académica, innovación doctrinaria y compromiso con la defensa y desarrollo del Estado Plurinacional de Bolivia.',
  mision:
    'Formar oficiales superiores con competencias de comando y estado mayor, a través de un modelo educativo integral basado en la doctrina militar, la investigación científica y los valores institucionales, para contribuir a la seguridad, defensa y desarrollo nacional.',
  titulaciones: [
    {
      title: 'Diplomado de Estado Mayor',
      req: 'Promedio general mayor o igual a 85.000 en los cuatro semestres',
      body: 'Los Oficiales Superiores Cursantes que alcancen un promedio general igual o mayor a 85,000 en los cuatro semestres y aprueben la tesis de Maestría, obtendrán el título de Diplomado de Estado Mayor.',
    },
    {
      title: 'Magister Scientiarum en Comando y Estado Mayor',
      req: 'Aprobación de Tesis de Grado ante la UNIMIL',
      body: 'Los Oficiales Superiores egresados que aprueben la Tesis de Grado, obtendrán el título de Magister Scientiarum en Comando y Estado Mayor ante la Universidad Militar (UNIMIL).',
    },
  ],
  footer: {
    lemaPrincipal: 'Ser antes que Parecer',
    eceme: 'Escuela de Comando y Estado Mayor del Ejército\n"Mcal. Andrés de Santa Cruz"\nBolivia',
    ubicacion: 'Cochabamba, Bolivia\nCalle Calama, entre calles Tumusla y Hamiraya',
  },
}

/**
 * Combina (deep merge superficial por secciones) los valores guardados en
 * localStorage con los valores por defecto. Si no hay nada guardado, devuelve
 * los valores por defecto.
 */
export function cargarPresentacion() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return PRESENTACION_DEFAULT
    const saved = JSON.parse(raw)
    return {
      ...PRESENTACION_DEFAULT,
      ...saved,
      header:   { ...PRESENTACION_DEFAULT.header,   ...(saved.header   || {}) },
      hero:     { ...PRESENTACION_DEFAULT.hero,     ...(saved.hero     || {}) },
      programa: { ...PRESENTACION_DEFAULT.programa, ...(saved.programa || {}) },
      footer:   { ...PRESENTACION_DEFAULT.footer,   ...(saved.footer   || {}) },
    }
  } catch {
    return PRESENTACION_DEFAULT
  }
}

export function guardarPresentacion(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function restablecerPresentacion() {
  localStorage.removeItem(STORAGE_KEY)
}
