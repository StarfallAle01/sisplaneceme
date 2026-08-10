// ─── Malla Curricular ECEME 2026 ─────────────────────────────────────────────

function computeFlatUCs(sem) {
  const fromEjes = sem.ejesCurriculares.flatMap(eje =>
    eje.modulos.flatMap(mod => mod.unidadesCompetencia)
  )
  const fromTx = sem.transversales?.unidadesCompetencia ?? []
  return [...fromEjes, ...fromTx]
}

const rawSemestres = [
  // ── I SEMESTRE ──────────────────────────────────────────────────────────────
  {
    id: 1,
    nombre: 'I Semestre',
    color: '#C5A028',
    totalDias: 108,
    totalHoras: 842,
    ejesCurriculares: [
      {
        nombre: 'TÁCTICA INFERIOR',
        color: '#A8881C',
        modulos: [
          {
            codigo: 'TI-MI-01',
            nombre: 'METODOLOGÍA DE LA INVESTIGACIÓN Y SOLUCIÓN DE PROBLEMAS',
            unidadesCompetencia: [
              {
                codigo: 'TI-MI-DG-01',
                nombre: 'Dinámicas de Grupo e Instrumentaciones',
                horas: 30,
                dias: 5,
                competenciaGeneral:
                  'Aplica técnicas de conducción de grupos para optimizar el trabajo en equipo en entornos militares y académicos, fomentando la cohesión, el liderazgo situacional y la resolución efectiva de conflictos.',
                unidadesAprendizaje: [
                  { numero: 1, titulo: 'Fundamentos del Comportamiento Grupal', horas: 8 },
                  { numero: 2, titulo: 'Técnicas de Conducción y Facilitación', horas: 12 },
                  { numero: 3, titulo: 'Resolución de Conflictos en el Equipo', horas: 10 },
                ],
                bibliografia: [
                  { tipo: 'Básica', referencia: 'ROBBINS, Stephen P.; JUDGE, Timothy A. Comportamiento Organizacional. 15.ª ed. México: Pearson Educación, 2013.' },
                  { tipo: 'Básica', referencia: 'LENCIONI, Patrick. Las Cinco Disfunciones de un Equipo. Barcelona: Empresa Activa, 2003.' },
                  { tipo: 'Complementaria', referencia: 'FRENCH, Wendell; BELL, Cecil. Desarrollo Organizacional. 5.ª ed. México: Prentice Hall, 1996.' },
                ],
              },
              { codigo: 'TI-MI-MI-02', nombre: 'Metodología de la Investigación Científica', horas: 60, dias: 10 },
              { codigo: 'TI-MI-EL-03', nombre: 'Ensayos Literarios', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'TI-PC-02',
            nombre: 'PLANIFICACIÓN Y CONDUCCIÓN TÁCTICA I',
            unidadesCompetencia: [
              { codigo: 'TI-PC-CE-01', nombre: 'El Comandante y su Estado Mayor', horas: 30, dias: 5 },
              {
                codigo: 'TI-PC-SO-03',
                nombre: 'Sistemas Operativos del Campo de Batalla',
                horas: 138,
                dias: 23,
                competenciaGeneral:
                  'Comprende y aplica los sistemas operativos del campo de batalla para planear y conducir operaciones militares de nivel táctico y operacional, integrando los elementos de combate de forma sincronizada y eficiente.',
                unidadesAprendizaje: [
                  { numero: 1, titulo: 'El Campo de Batalla y sus Dimensiones', horas: 18 },
                  { numero: 2, titulo: 'Sistema de Mando y Control (C2)', horas: 30 },
                  { numero: 3, titulo: 'Sistema de Inteligencia Operacional', horas: 24 },
                  { numero: 4, titulo: 'Sistema de Fuegos y Apoyo de Fuego', horas: 24 },
                  { numero: 5, titulo: 'Movilidad, Contramovilidad y Protección', horas: 24 },
                  { numero: 6, titulo: 'Sistema de Sostenimiento Logístico', horas: 18 },
                ],
                bibliografia: [
                  { tipo: 'Básica', referencia: 'EJÉRCITO DEL PERÚ. Manual de Operaciones ME 31-10. Lima: Dirección de Doctrina del Ejército, 2015.' },
                  { tipo: 'Básica', referencia: 'CLAUSEWITZ, Carl von. De la Guerra. Madrid: La Esfera de los Libros, 2005.' },
                  { tipo: 'Básica', referencia: 'US ARMY. Field Manual FM 3-0: Operations. Washington D.C.: Department of the Army, 2017.' },
                  { tipo: 'Complementaria', referencia: 'CENTRO CONJUNTO DE OPERACIONES. Doctrina para el Empleo de las Fuerzas Armadas. Lima: CCFFAA, 2019.' },
                ],
              },
              { codigo: 'TI-PC-TC-02', nombre: 'Teoría y Conducción de las GG. UU. CC.', horas: 42, dias: 7 },
              { codigo: 'TI-PC-PP-04', nombre: 'Proceso de Planeamiento I', horas: 102, dias: 17 },
              { codigo: 'TI-PC-OO-05', nombre: 'Operaciones Ofensivas', horas: 48, dias: 6 },
              { codigo: 'TI-PC-OD-06', nombre: 'Operaciones Defensivas', horas: 48, dias: 6 },
              { codigo: 'TI-PC-OR-07', nombre: 'Operaciones Retrógradas', horas: 48, dias: 6 },
              { codigo: 'TI-PC-TP-08', nombre: 'Técnica y Preparación de Ejercicios', horas: 54, dias: 9 },
            ],
          },
          {
            codigo: 'TI-EM-03',
            nombre: 'Ejercicios Militares',
            unidadesCompetencia: [
              { codigo: 'TI-EM-EM-01', nombre: 'Ejercicios Militares', horas: 50, dias: 5 },
            ],
          },
        ],
      },
    ],
    transversales: {
      color: '#5A6B7C',
      unidadesCompetencia: [
        { codigo: 'TR-CS-01', nombre: 'Conferencias, Seminarios', horas: 12, dias: 2 },
        { codigo: 'TR-TT-02', nombre: 'Taller y Defensa de Perfil de Tesis', horas: 12, dias: 2 },
        { codigo: 'TR-EF-03', nombre: 'Entrenamiento Físico Militar y Deportes', horas: 138, dias: null },
      ],
    },
  },

  // ── II SEMESTRE ─────────────────────────────────────────────────────────────
  {
    id: 2,
    nombre: 'II Semestre',
    color: '#0A1628',
    totalDias: 94,
    totalHoras: 742,
    ejesCurriculares: [
      {
        nombre: 'TÁCTICA SUPERIOR',
        color: '#050D1A',
        modulos: [
          {
            codigo: 'TS-LM-01',
            nombre: 'LIDERAZGO MILITAR',
            unidadesCompetencia: [
              { codigo: 'TS-LM-FC-01', nombre: 'Formación de Comandantes', horas: 30, dias: 5 },
              { codigo: 'TS-LM-AM-02', nombre: 'Acción de Mando y Liderazgo', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'TS-EM-02',
            nombre: 'ESTUDIOS MILITARES COMPLEMENTARIOS I',
            unidadesCompetencia: [
              { codigo: 'TS-EM-HM-01', nombre: 'Historia Militar Aplicada I', horas: 48, dias: 8 },
              { codigo: 'TS-EM-DI-02', nombre: 'Derecho Internacional de los Conflictos Armados', horas: 30, dias: 5 },
              { codigo: 'TS-EM-GC-03', nombre: 'Guerras de 4ta Generación - Teoría y Bases de la Guerra Asimétrica, Guerra sin Restricción y Guerra Híbrida', horas: 42, dias: 7 },
              { codigo: 'TS-EM-DP-04', nombre: 'Doctrina de Patriotas', horas: 60, dias: 10 },
            ],
          },
          {
            codigo: 'TS-PC-03',
            nombre: 'PLANEAMIENTO Y CONDUCCIÓN TÁCTICA II',
            unidadesCompetencia: [
              { codigo: 'TS-PC-TA-01', nombre: 'Teoría de las Armas Combinadas', horas: 45, dias: 8 },
              { codigo: 'TS-PC-TC-02', nombre: 'Teoría y Conducción de las GG. UU. BB.', horas: 45, dias: 8 },
              { codigo: 'TS-PC-LG-03', nombre: 'La Logística en las GG. UU. BB.', horas: 45, dias: 8 },
              { codigo: 'TS-PC-PP-04', nombre: 'Proceso de Planeamiento II', horas: 72, dias: 12 },
            ],
          },
          {
            codigo: 'TS-EM-04',
            nombre: 'Ejercicios Militares',
            unidadesCompetencia: [
              { codigo: 'TS-EM-EM-02', nombre: 'Ejercicios Militares II', horas: 70, dias: 7 },
            ],
          },
        ],
      },
    ],
    transversales: {
      color: '#5A6B7C',
      unidadesCompetencia: [
        { codigo: 'TR-CS-04', nombre: 'Conferencias, Seminarios, Simposios, etc.', horas: 18, dias: 3 },
        { codigo: 'TR-TT-05', nombre: 'Taller y Defensa de Perfil de Tesis', horas: 90, dias: 11 },
        { codigo: 'TR-EF-06', nombre: 'Entrenamiento Físico Militar y Deportes', horas: 126, dias: null },
      ],
    },
  },

  // ── III SEMESTRE ────────────────────────────────────────────────────────────
  {
    id: 3,
    nombre: 'III Semestre',
    color: '#C5A028',
    totalDias: 114,
    totalHoras: 868,
    ejesCurriculares: [
      {
        nombre: 'ESTRATEGIA OPERATIVA',
        color: '#A8881C',
        modulos: [
          {
            codigo: 'EO-EM-01',
            nombre: 'ESTUDIOS MILITARES COMPLEMENTARIOS II',
            unidadesCompetencia: [
              { codigo: 'EO-EM-HM-01', nombre: 'Historia Militar Aplicada III', horas: 36, dias: 6 },
              { codigo: 'EO-EM-FG-02', nombre: 'Filosofía de la Guerra', horas: 30, dias: 5 },
              { codigo: 'EO-EM-GD-03', nombre: 'Geopolítica y Defensa Nacional', horas: 30, dias: 5 },
              { codigo: 'EO-EM-GM-04', nombre: 'Geografía Militar Aplicada', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'EO-TE-02',
            nombre: 'TEORÍA DE LA ESTRATEGIA',
            unidadesCompetencia: [
              { codigo: 'EO-TE-EG-01', nombre: 'Teoría de la Estrategia General', horas: 30, dias: 5 },
              { codigo: 'EO-TE-EM-02', nombre: 'Teoría de la Estrategia Militar', horas: 30, dias: 5 },
              { codigo: 'EO-TE-EO-03', nombre: 'Teoría de la Estrategia Operativa', horas: 45, dias: 8 },
            ],
          },
          {
            codigo: 'EO-EO-03',
            nombre: 'ESTRATEGIA OPERATIVA I',
            unidadesCompetencia: [
              { codigo: 'EO-EO-FT-01', nombre: 'Las Fuerzas Terrestres del Teatro de Operaciones', horas: 45, dias: 8 },
              { codigo: 'EO-EO-UC-02', nombre: 'Unidades y Comandos Logísticos', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'EO-EO-04',
            nombre: 'ESTRATEGIA OPERATIVA II',
            unidadesCompetencia: [
              { codigo: 'EO-EO-PE-01', nombre: 'Planeamiento Estratégico Operativo', horas: 132, dias: 22 },
              { codigo: 'EO-EO-CE-02', nombre: 'Conducción Estratégica Operativa', horas: 45, dias: 8 },
            ],
          },
          {
            codigo: 'EO-NA-05',
            nombre: 'NUEVAS AMENAZAS Y RIESGOS A LA SEGURIDAD, DEFENSA Y DESARROLLO DEL ESTADO',
            unidadesCompetencia: [
              { codigo: 'EO-NA-TN-01', nombre: 'Teoría de las Nuevas Amenazas y Riesgos', horas: 30, dias: 5 },
              { codigo: 'EO-NA-LC-02', nombre: 'Lucha contra el Contrabando', horas: 30, dias: 5 },
              { codigo: 'EO-NA-LN-03', nombre: 'Lucha contra el Narcotráfico', horas: 30, dias: 5 },
              { codigo: 'EO-NA-DN-04', nombre: 'Desastres Naturales', horas: 24, dias: 4 },
              { codigo: 'EO-NA-EI-05', nombre: 'Explotación Ilegal de Recursos Naturales', horas: 24, dias: 4 },
            ],
          },
          {
            codigo: 'EO-EM-06',
            nombre: 'Ejercicios Militares',
            unidadesCompetencia: [
              { codigo: 'EO-EM-EM-01', nombre: 'Ejercicios Militares III', horas: 60, dias: 10 },
              { codigo: 'EO-EM-EM-02', nombre: 'Ejercicios Militares IV', horas: 45, dias: 8 },
            ],
          },
        ],
      },
    ],
    transversales: {
      color: '#5A6B7C',
      unidadesCompetencia: [
        { codigo: 'TR-CS-07', nombre: 'Conferencias, Seminarios', horas: 12, dias: 2 },
        { codigo: 'TR-TT-08', nombre: 'Taller de Tesis', horas: 18, dias: 3 },
        { codigo: 'TR-EF-09', nombre: 'Entrenamiento Físico Militar y Deportes', horas: 144, dias: null },
      ],
    },
  },

  // ── IV SEMESTRE ─────────────────────────────────────────────────────────────
  {
    id: 4,
    nombre: 'IV Semestre',
    color: '#0A1628',
    totalDias: 94,
    totalHoras: 750,
    ejesCurriculares: [
      {
        nombre: 'ESTRATEGIA MILITAR',
        color: '#050D1A',
        modulos: [
          {
            codigo: 'EM-EN',
            nombre: 'ESTRATEGIA NACIONAL',
            unidadesCompetencia: [
              { codigo: 'EM-EN-GE-01', nombre: 'Generalidades de la Estrategia Nacional', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'EM-ME-01',
            nombre: 'MENCIÓN EN ESTRATEGIA',
            unidadesCompetencia: [
              { codigo: 'EM-ME-CE-01', nombre: 'Concepción de la Estrategia Militar', horas: 30, dias: 5 },
              { codigo: 'EM-ME-CE-02', nombre: 'Conducción de la Estrategia Militar', horas: 45, dias: 8 },
              { codigo: 'EM-ME-SE-03', nombre: 'Seguridad Estratégica', horas: 36, dias: 6 },
              { codigo: 'EM-ME-CE-04', nombre: 'Constitución y Equipamiento del Teatro de Operaciones', horas: 45, dias: 8 },
              { codigo: 'EM-ME-MC-05', nombre: 'Movilización, Concentración y Despliegue Estratégico', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'EM-MI-02',
            nombre: 'MENCIÓN EN INTELIGENCIA',
            unidadesCompetencia: [
              { codigo: 'EM-MI-EI-01', nombre: 'Estudios de Inteligencia Estratégica Militar', horas: 30, dias: 5 },
              { codigo: 'EM-MI-AA-02', nombre: 'Análisis de la Amenaza y el Poder Militar', horas: 30, dias: 5 },
              { codigo: 'EM-MI-AP-03', nombre: 'Análisis y Predicción', horas: 36, dias: 6 },
              { codigo: 'EM-MI-PI-04', nombre: 'Proceso de Producción de Inteligencia Estratégica', horas: 45, dias: 8 },
              { codigo: 'EM-MI-PE-05', nombre: 'Prospectiva Estratégica', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'EM-ML-03',
            nombre: 'MENCIÓN EN LOGÍSTICA',
            unidadesCompetencia: [
              { codigo: 'EM-ML-TL-01', nombre: 'Teoría de la Logística en la Estrategia Militar', horas: 30, dias: 5 },
              { codigo: 'EM-ML-DT-02', nombre: 'División Territorial', horas: 30, dias: 5 },
              { codigo: 'EM-ML-CA-03', nombre: 'Comandos y Atribuciones', horas: 36, dias: 6 },
              { codigo: 'EM-ML-LN-04', nombre: 'La Logística en el Nivel Estratégico Militar', horas: 45, dias: 8 },
              { codigo: 'EM-ML-LA-05', nombre: 'La Logística en Apoyo al Equipamiento del Teatro de Operaciones', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'EM-MR-04',
            nombre: 'MENCIÓN EN RECURSOS HUMANOS',
            unidadesCompetencia: [
              { codigo: 'EM-MR-EO-01', nombre: 'Desarrollo y Estructura Organizacional', horas: 30, dias: 5 },
              { codigo: 'EM-MR-DH-02', nombre: 'Desarrollo Humano', horas: 30, dias: 5 },
              { codigo: 'EM-MR-GR-03', nombre: 'Gestión de Recursos Humanos', horas: 36, dias: 6 },
              { codigo: 'EM-MR-RP-04', nombre: 'Relación entre las Personas y las Organizaciones', horas: 30, dias: 5 },
              { codigo: 'EM-MR-PE-05', nombre: 'Planificación Estratégica de los RR.HH.', horas: 45, dias: 8 },
            ],
          },
          {
            codigo: 'EM-AU-05',
            nombre: 'ADMINISTRACIÓN DE UNIDADES I',
            unidadesCompetencia: [
              { codigo: 'EM-MR-PL-05', nombre: 'Procedimientos Legales para la Administración de las Unidades Militares', horas: 36, dias: 6 },
              { codigo: 'EM-AU-EE-01', nombre: 'Estudio de Estado Mayor', horas: 36, dias: 6 },
              { codigo: 'EM-AU-SI-02', nombre: 'Sumarios Informativos', horas: 36, dias: 6 },
              { codigo: 'EM-AU-EP-03', nombre: 'Elaboración de Planes', horas: 36, dias: 6 },
            ],
          },
          {
            codigo: 'EM-AU-06',
            nombre: 'ADMINISTRACIÓN DE UNIDADES II',
            unidadesCompetencia: [
              { codigo: 'EM-AU-FE-01', nombre: 'Formulación y Evaluación de Proyectos', horas: 48, dias: 8 },
              { codigo: 'EM-AU-EP-02', nombre: 'Elaboración del POA', horas: 24, dias: 4 },
              { codigo: 'EM-AU-AF-03', nombre: 'Administración Financiera de Unidades', horas: 30, dias: 5 },
            ],
          },
          {
            codigo: 'EM-EM-05',
            nombre: 'Ejercicios Militares',
            unidadesCompetencia: [
              { codigo: 'EM-EM-EM-05', nombre: 'Ejercicios Militares V', horas: 70, dias: 7 },
            ],
          },
        ],
      },
    ],
    transversales: {
      color: '#5A6B7C',
      unidadesCompetencia: [
        { codigo: 'TR-CS-10', nombre: 'Conferencias, Seminarios, Simposios, etc.', horas: 18, dias: 3 },
        { codigo: 'TR-TT-11', nombre: 'Taller y Defensa de Tesis', horas: 104, dias: 12 },
        { codigo: 'TR-EF-12', nombre: 'Entrenamiento Físico Militar y Deportes', horas: 126, dias: null },
      ],
    },
  },
]

const semestresData = rawSemestres.map(sem => ({
  ...sem,
  unidadesCompetencia: computeFlatUCs(sem),
}))

export default semestresData

// ─── Named exports (backward-compat con Calendario.jsx y Dashboard.jsx) ───────

export function getUCsSemestre(semestre) {
  return (semestre.unidadesCompetencia || []).map(uc => ({
    ...uc,
    eje: semestre.nombre,
  }))
}

export const planData = {
  totalHoras: 3202,
  modalidad: 'Maestría',
  ejesCurriculares: [
    { id: 1, nombre: 'TÁCTICA INFERIOR',        horas: 1560, descripcion: 'Metodología, planificación y conducción táctica' },
    { id: 2, nombre: 'CIENCIAS MILITARES',       horas: 876,  descripcion: 'Geopolítica y doctrina militar' },
    { id: 3, nombre: 'PENSAMIENTO ESTRATÉGICO',  horas: 766,  descripcion: 'Inteligencia y análisis estratégico' },
  ],
  semestres: semestresData,
}
