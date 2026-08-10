import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Clock, Calendar, BookOpen, ChevronRight, Loader2 } from 'lucide-react'
import semestresData from '../data/planData'
import { primerSemestreMap }  from '../data/primerSemestreData'
import { segundoSemestreMap } from '../data/segundoSemestreData'
import { tercerSemestreMap }  from '../data/tercerSemestreData'
import api from '../services/api'

const detailMap = { ...primerSemestreMap, ...segundoSemestreMap, ...tercerSemestreMap }

function buildCompleteUCMap(semestres) {
  const map = {}
  semestres.forEach(sem => {
    ;(sem.ejesCurriculares || []).forEach(eje => {
      ;(eje.modulos || []).forEach(mod => {
        ;(mod.unidadesCompetencia || []).forEach(uc => {
          map[uc.codigo] = uc
        })
      })
    })
    if (sem.transversales?.unidadesCompetencia) {
      sem.transversales.unidadesCompetencia.forEach(uc => {
        map[uc.codigo] = uc
      })
    }
  })
  return map
}

const NAVY      = '#0A1628'
const NAVY_MID  = '#2B4C7A'
const GOLD      = '#C5A028'
const VIOLET    = '#3D2B56'
const INK       = '#111827'
const MUTED     = '#6B7280'
const TEXT_LT   = '#E2E8F0'
const DIM_LT    = '#94A3B8'

function UCCard({ uc, color, isSelected, onClick }) {
  const borderAlpha = isSelected ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'
  const horas = uc.horas_totales || uc.horas || 0
  const dias  = uc.dias || 0

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderTopColor = VIOLET
          e.currentTarget.style.backgroundColor = NAVY_MID
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderTopColor = color || GOLD
          e.currentTarget.style.backgroundColor = NAVY
        }
      }}
      className="w-full text-left p-4 rounded-lg flex flex-col gap-2 transition-colors"
      style={{
        backgroundColor: isSelected ? NAVY_MID : NAVY,
        borderTop: `4px solid ${isSelected ? VIOLET : (color || GOLD)}`,
        borderRight: `1px solid ${borderAlpha}`,
        borderBottom: `1px solid ${borderAlpha}`,
        borderLeft: `1px solid ${borderAlpha}`,
      }}
    >
      <span
        className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded tracking-wider leading-none self-start"
        style={{ backgroundColor: `${GOLD}20`, color: GOLD }}
      >
        {uc.codigo}
      </span>
      <p className="text-sm font-medium leading-snug flex-1" style={{ color: TEXT_LT }}>{uc.nombre}</p>
      <div className="flex items-center gap-3 pt-2 border-t text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <span className="flex items-center gap-1" style={{ color: GOLD }}>
          <Clock size={10} /> {horas > 0 ? `${horas} hrs` : '—'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span className="flex items-center gap-1" style={{ color: DIM_LT }}>
          <Calendar size={10} /> {dias > 0 ? `${dias} dias` : '—'}
        </span>
      </div>
    </button>
  )
}

function SectionTitle({ accent, children }) {
  return (
    <h3
      className="font-heading text-white text-sm font-semibold mb-3 flex items-center gap-2.5 uppercase tracking-wider"
    >
      <span className="w-4 h-px shrink-0" style={{ backgroundColor: accent }} />
      {children}
    </h3>
  )
}

function Drawer({ uc, onClose }) {
  const accent = uc?.ejeColor ?? GOLD

  const horas    = uc?.horas_totales || uc?.horas || 0
  const dias     = uc?.dias || 0
  const hasHoras = horas > 0
  const hasDias  = dias  > 0
  const hasUAs   = (uc?.unidadesAprendizaje || uc?.unidades_aprendizaje || [])?.length > 0
  const hasComp  = uc?.competencia_general && uc.competencia_general !== 'Informacion en desarrollo'
    ? true : (uc?.competenciaGeneral && uc.competenciaGeneral !== 'Informacion en desarrollo')
  const hasElems = (uc?.elementos_competencia || uc?.elementosCompetencia || [])?.length > 0
  const hasContent = hasComp || hasElems || hasUAs

  const compGen = uc?.competencia_general || uc?.competenciaGeneral || null
  const elemsComp = uc?.elementos_competencia || uc?.elementosCompetencia || []
  const unidadesAp = uc?.unidadesAprendizaje || uc?.unidades_aprendizaje || []

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/55 z-40 transition-opacity duration-300 ${
          uc ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-[500px] z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-out border-l border-white/8 ${
          uc ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: NAVY }}
      >
        {uc && (
          <>
            <div
              className="flex items-start justify-between px-6 py-5 shrink-0"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                borderLeft: `4px solid ${accent}`,
              }}
            >
              <div className="flex-1 min-w-0 pl-3">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded tracking-widest"
                    style={{ backgroundColor: `${accent}22`, color: accent }}
                  >
                    {uc.codigo}
                  </span>
                  {uc.moduloNombre && (
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {uc.moduloNombre}
                    </span>
                  )}
                </div>
                <h2 className="font-heading text-white font-medium leading-snug" style={{ fontSize: '18px' }}>
                  {uc.nombre}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/80 transition-colors mt-0.5 ml-4 shrink-0 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-8">

                <div className="flex gap-3">
                  {hasHoras && (
                    <div
                      className="flex-1 rounded-lg px-4 py-3 text-center border border-white/8"
                      style={{ backgroundColor: '#FFFFFF0A' }}
                    >
                      <p className="font-heading text-2xl font-semibold" style={{ color: GOLD }}>
                        {horas}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        horas totales
                      </p>
                    </div>
                  )}
                  {hasDias && (
                    <div
                      className="flex-1 rounded-lg px-4 py-3 text-center border border-white/8"
                      style={{ backgroundColor: '#FFFFFF0A' }}
                    >
                      <p className="font-heading text-2xl font-semibold" style={{ color: GOLD }}>
                        {dias}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        dias habiles
                      </p>
                    </div>
                  )}
                  {hasUAs && (
                    <div
                      className="flex-1 rounded-lg px-4 py-3 text-center border border-white/8"
                      style={{ backgroundColor: '#FFFFFF06' }}
                    >
                      <p className="font-heading text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {unidadesAp.length}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        unidades
                      </p>
                    </div>
                  )}
                </div>

                {compGen && (
                  <div>
                    <SectionTitle accent={accent}>Competencia General</SectionTitle>
                    <p
                      className="leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.72)', fontSize: '14px' }}
                    >
                      {compGen}
                    </p>
                  </div>
                )}

                {hasElems && (
                  <div>
                    <SectionTitle accent={accent}>Elementos de Competencia</SectionTitle>
                    <ol className="space-y-3">
                      {elemsComp.map((elem, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3"
                          style={{ borderBottom: idx < elemsComp.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: idx < elemsComp.length - 1 ? '12px' : '0' }}
                        >
                          <span
                            className="font-mono font-bold shrink-0 mt-0.5"
                            style={{ color: accent, fontSize: '12px', minWidth: '20px' }}
                          >
                            {idx + 1}.
                          </span>
                          <p
                            className="leading-relaxed flex-1"
                            style={{ color: 'rgba(255,255,255,0.68)', fontSize: '13px' }}
                          >
                            {typeof elem === 'string' ? elem : (elem.nombre || elem.descripcion || '')}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {hasUAs && (
                  <div>
                    <SectionTitle accent={accent}>Unidades de Aprendizaje</SectionTitle>
                    <div>
                      {unidadesAp.map((ua, idx) => (
                        <div
                          key={ua.numero || idx}
                          className="flex items-start gap-3 py-2.5"
                          style={{
                            borderBottom: idx < unidadesAp.length - 1
                              ? '1px solid rgba(255,255,255,0.06)'
                              : 'none',
                          }}
                        >
                          <span
                            className="font-mono font-bold shrink-0 mt-0.5"
                            style={{ color: `${accent}CC`, fontSize: '11px', minWidth: '28px' }}
                          >
                            U.{ua.numero || (idx + 1)}
                          </span>
                          <span
                            className="flex-1 leading-snug"
                            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}
                          >
                            {ua.titulo || ua.nombre || ''}
                          </span>
                          {(ua.horas !== null && ua.horas !== undefined) && (
                            <span
                              className="shrink-0 tabular-nums"
                              style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}
                            >
                              {ua.horas}h
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!hasContent && (
                  <div className="text-center py-12">
                    <BookOpen size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                      Contenido en construccion
                    </p>
                  </div>
                )}

              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default function SemestreDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiSemestre, setApiSemestre] = useState(null)
  const [usandoLocal, setUsandoLocal] = useState(false)

  const completeUCMap = useMemo(() => buildCompleteUCMap(semestresData), [])

  const fetchSemestreData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: mallas } = await api.get('/mallas')
      const mallaList = Array.isArray(mallas) ? mallas : []
      if (mallaList.length === 0) {
        throw new Error('No mallas found')
      }
      const activa = mallaList.find(m => m.estado === 'activo') || mallaList[0]
      const { data } = await api.get(`/mallas/${activa.id}/completa`)
      const semestres = data?.semestres || []
      const matched = semestres.find(s => s.id === Number(id))
      if (matched) {
        setApiSemestre(matched)
        setLoading(false)
        return
      }
      throw new Error('Semestre not found in API')
    } catch {
      setUsandoLocal(true)
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSemestreData()
  }, [fetchSemestreData])

  const localSemestre = semestresData.find(s => s.id === Number(id))

  const semestreSource = apiSemestre || (usandoLocal ? localSemestre : null)
  const semestre = usandoLocal ? localSemestre : semestreSource

  if (loading) {
    return (
      <div className="text-center py-20" style={{ color: MUTED }}>
        <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
        Cargando semestre...
      </div>
    )
  }

  if (!semestre) {
    return (
      <div className="text-center py-20">
        <p className="text-sm" style={{ color: MUTED }}>Semestre no encontrado.</p>
        <button
          onClick={() => navigate('/malla')}
          className="mt-4 text-sm transition-colors"
          style={{ color: MUTED }}
          onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
        >
          Volver a Malla Curricular
        </button>
      </div>
    )
  }

  const ejes = apiSemestre
    ? (semestre.ejes_curriculares || semestre.ejesCurriculares || [])
    : (semestre.ejesCurriculares || [])

  const tx = apiSemestre
    ? (semestre.transversales || [])
    : (semestre.transversales || null)

  const totalUCsFromEjes = ejes.reduce((count, eje) => {
    const mods = eje.modulos || []
    return count + mods.reduce((c, mod) => {
      const ucs = mod.unidades_competencia || mod.unidadesCompetencia || []
      return c + ucs.length
    }, 0)
  }, 0)

  const txUCs = apiSemestre
    ? (tx || []).reduce((count, t) => {
        const ucs = t.unidades_competencia || t.unidadesCompetencia || []
        return count + ucs.length
      }, 0)
    : (semestre.transversales?.unidadesCompetencia?.length || 0)

  const totalUCs = totalUCsFromEjes + txUCs

  const handleSelect = (uc, ejeColor, moduloNombre) => {
    if (selected?.codigo === uc.codigo) {
      setSelected(null)
      return
    }
    const detail = detailMap[uc.codigo] || completeUCMap[uc.codigo]
    const apiCompGeneral = uc.competencia_general || detail?.competenciaGeneral || null
    const apiElementos = uc.elementos_competencia || detail?.elementosCompetencia || null
    const apiUAs = uc.unidades_aprendizaje || detail?.unidadesAprendizaje || null

    setSelected({
      ...uc,
      ejeColor,
      moduloNombre,
      ...(apiCompGeneral ? { competencia_general: apiCompGeneral, competenciaGeneral: apiCompGeneral } : {}),
      ...(apiElementos ? { elementos_competencia: apiElementos, elementosCompetencia: apiElementos } : {}),
      ...(apiUAs ? { unidades_aprendizaje: apiUAs, unidadesAprendizaje: apiUAs } : {}),
    })
  }

  const mainEje = ejes[0]
  const totalHoras = semestre.total_horas || semestre.totalHoras || 0
  const totalDias  = semestre.total_dias  || semestre.totalDias  || 0

  return (
    <div className="space-y-8">

      <nav className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
        <button
          onClick={() => navigate('/malla')}
          className="transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.color = VIOLET)}
          onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
        >
          Malla Curricular
        </button>
        <ChevronRight size={12} className="shrink-0" />
        <span style={{ color: NAVY }}>{semestre.nombre}</span>
        {usandoLocal && (
          <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F59E0B20', color: '#FCD34D' }}>
            offline
          </span>
        )}
      </nav>

      <div
        className="rounded-lg px-6 py-5"
        style={{ backgroundColor: NAVY }}
      >
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '28px' }}>
          {semestre.nombre}
        </h1>
        {semestre.nombre_corto && (
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {semestre.nombre_corto}
          </p>
        )}
        {mainEje && (
          <p className="text-sm font-medium uppercase tracking-wider mt-1" style={{ color: '#94A3B8' }}>
            {mainEje.nombre}
          </p>
        )}

        <div className="flex items-center gap-6 mt-5">
          <div>
            <span className="font-heading text-2xl font-medium" style={{ color: GOLD }}>
              {totalDias.toLocaleString()}
            </span>
            <span className="text-xs ml-1.5" style={{ color: DIM_LT }}>dias habiles</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div>
            <span className="font-heading text-2xl font-medium" style={{ color: GOLD }}>
              {totalHoras.toLocaleString()}
            </span>
            <span className="text-xs ml-1.5" style={{ color: DIM_LT }}>horas</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div>
            <span className="font-heading text-2xl font-medium" style={{ color: GOLD }}>
              {totalUCs}
            </span>
            <span className="text-xs ml-1.5" style={{ color: DIM_LT }}>unidades de competencia</span>
          </div>
        </div>
      </div>

      {ejes.map(eje => (
        <div key={eje.nombre} className="space-y-6">
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded"
            style={{ backgroundColor: NAVY }}
          >
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: eje.color || semestre.color || GOLD }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
              {eje.nombre}
            </p>
          </div>

          {(eje.modulos || []).map(modulo => (
            <div key={modulo.codigo || modulo.nombre} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
                  style={{ color: apiSemestre ? INK : INK }}
                >
                  {modulo.nombre}
                </h3>
                <span className="flex-1 h-px" style={{ backgroundColor: `${NAVY}25` }} />
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full shrink-0 tabular-nums font-medium"
                  style={{ backgroundColor: `${NAVY}15`, color: NAVY }}
                >
                  {(modulo.unidades_competencia || modulo.unidadesCompetencia || []).length} UC
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {(modulo.unidades_competencia || modulo.unidadesCompetencia || []).map(uc => (
                  <UCCard
                    key={uc.codigo}
                    uc={uc}
                    color={eje.color || semestre.color || GOLD}
                    isSelected={selected?.codigo === uc.codigo}
                    onClick={() => handleSelect(uc, eje.color || semestre.color || GOLD, modulo.nombre)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {tx && !apiSemestre && semestre.transversales?.unidadesCompetencia?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3
              className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
              style={{ color: INK }}
            >
              Unidades Transversales
            </h3>
            <span className="flex-1 h-px" style={{ backgroundColor: `${NAVY}25` }} />
            <span
              className="text-[10px] px-2 py-0.5 rounded-full shrink-0 tabular-nums font-medium"
              style={{ backgroundColor: `${NAVY}15`, color: NAVY }}
            >
              {semestre.transversales.unidadesCompetencia.length} UC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {semestre.transversales.unidadesCompetencia.map(uc => (
              <UCCard
                key={uc.codigo}
                uc={uc}
                color={semestre.transversales.color}
                isSelected={selected?.codigo === uc.codigo}
                onClick={() => handleSelect(uc, semestre.transversales.color, 'Transversales')}
              />
            ))}
          </div>
        </div>
      )}

      {tx && apiSemestre && Array.isArray(tx) && tx.map((transversal) => {
        const tUCs = transversal.unidades_competencia || transversal.unidadesCompetencia || []
        if (tUCs.length === 0) return null
        return (
          <div key={transversal.id || transversal.nombre} className="space-y-3">
            <div className="flex items-center gap-3">
              <h3
                className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
                style={{ color: INK }}
              >
                {transversal.nombre || 'Transversales'}
              </h3>
              <span className="flex-1 h-px" style={{ backgroundColor: `${NAVY}25` }} />
              <span
                className="text-[10px] px-2 py-0.5 rounded-full shrink-0 tabular-nums font-medium"
                style={{ backgroundColor: `${NAVY}15`, color: NAVY }}
              >
                {tUCs.length} UC
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {tUCs.map(uc => (
                <UCCard
                  key={uc.codigo}
                  uc={uc}
                  color={transversal.color || '#5A6B7C'}
                  isSelected={selected?.codigo === uc.codigo}
                  onClick={() => handleSelect(uc, transversal.color || '#5A6B7C', transversal.nombre || 'Transversales')}
                />
              ))}
            </div>
          </div>
        )
      })}

      <Drawer uc={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
