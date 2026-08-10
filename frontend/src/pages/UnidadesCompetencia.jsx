import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import semestresData from '../data/planData'
import { BookOpen, Clock, Layers, Search, ChevronDown, ChevronRight, AlertCircle, Loader2, Filter, X } from 'lucide-react'

const NAVY       = '#0A1628'
const NAVY_MID   = '#2B4C7A'
const GOLD       = '#C5A028'
const VIOLET     = '#3D2B56'
const TEXT_LT    = '#E2E8F0'
const DIM_LT     = '#94A3B8'
const CODE_LT    = '#7B90A8'

export default function UnidadesCompetencia() {
  const navigate = useNavigate()

  const [mallaData, setMallaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usandoLocal, setUsandoLocal] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [expandedUCs, setExpandedUCs] = useState(new Set())
  const [filterEje, setFilterEje] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: mallasList } = await api.get('/mallas')
      const list = Array.isArray(mallasList) ? mallasList : []
      if (list.length === 0) {
        setUsandoLocal(true)
        setLoading(false)
        return
      }

      const activa = list.find(m => m.estado === 'activo') || list[0]
      const { data } = await api.get(`/mallas/${activa.id}/completa`)
      setMallaData(data)
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.')
      setUsandoLocal(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const rawSemestres = mallaData?.semestres && mallaData.semestres.length > 0
    ? mallaData.semestres
    : usandoLocal ? semestresData : semestresData

  const allCollected = useMemo(() => {
    const results = []

    rawSemestres.forEach((sem) => {
      const ejes = sem.ejes_curriculares || sem.ejesCurriculares || []

      ejes.forEach((eje) => {
        const mods = eje.modulos || []
        mods.forEach((mod) => {
          const ucs = mod.unidades_competencia || mod.unidadesCompetencia || []
          ucs.forEach((uc) => {
            results.push({
              ...uc,
              _semestreId: sem.id,
              _semestreNombre: sem.nombre,
              _semestreColor: sem.color || GOLD,
              _ejeNombre: eje.nombre,
              _ejeColor: eje.color || GOLD,
              _moduloCodigo: mod.codigo,
              _moduloNombre: mod.nombre,
              _source: 'eje',
            })
          })
        })
      })

      const rawTransversales = sem.transversales
      let txList = []
      if (Array.isArray(rawTransversales)) {
        txList = rawTransversales
      } else if (rawTransversales && typeof rawTransversales === 'object') {
        txList = [rawTransversales]
      }

      txList.forEach((tx) => {
        const ucs = tx.unidades_competencia || tx.unidadesCompetencia || []
        ucs.forEach((uc) => {
          results.push({
            ...uc,
            _semestreId: sem.id,
            _semestreNombre: sem.nombre,
            _semestreColor: sem.color || GOLD,
            _ejeNombre: 'TRANSVERSALES',
            _ejeColor: tx.color || '#5A6B7C',
            _moduloCodigo: 'TR',
            _moduloNombre: 'Transversales',
            _source: 'transversal',
          })
        })
      })
    })

    return results
  }, [rawSemestres])

  const ejesUnicos = [...new Set(allCollected.map(uc => uc._ejeNombre))]
    .sort()

  const filtered = allCollected.filter((uc) => {
    const matchesSearch =
      !searchTerm ||
      uc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (uc.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (uc._ejeNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (uc._moduloNombre || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEje = !filterEje || filterEje === '' || uc._ejeNombre === filterEje

    return matchesSearch && matchesEje
  })

  const groupedBySemestre = {}
  filtered.forEach((uc) => {
    const key = uc._semestreId
    if (!groupedBySemestre[key]) {
      groupedBySemestre[key] = {
        id: uc._semestreId,
        nombre: uc._semestreNombre,
        color: uc._semestreColor,
        ucs: [],
      }
    }
    groupedBySemestre[key].ucs.push(uc)
  })

  const sortedGroups = Object.values(groupedBySemestre).sort((a, b) => a.id - b.id)

  const totalHoras = allCollected.reduce(
    (sum, uc) => sum + (uc.horas_totales || uc.horas || 0), 0
  )

  const toggleExpand = (ucKey) => {
    setExpandedUCs((prev) => {
      const next = new Set(prev)
      if (next.has(ucKey)) {
        next.delete(ucKey)
      } else {
        next.add(ucKey)
      }
      return next
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterEje('')
  }

  const hasFilters = searchTerm !== '' || filterEje !== ''

  return (
    <div className="space-y-6">

      <div
        className="rounded-lg px-6 py-5"
        style={{ backgroundColor: NAVY }}
      >
        <h1
          className="font-heading font-semibold"
          style={{ color: GOLD, fontSize: '28px' }}
        >
          Unidades de Competencia
        </h1>
        <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
          Listado completo de asignaturas, contenidos mínimos y carga horaria por eje curricular
          {usandoLocal && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#F59E0B20', color: '#FCD34D' }}>
              Modo offline
            </span>
          )}
        </p>
      </div>

      <div className="rounded-lg px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOLD}18` }}>
            <BookOpen size={18} style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#64748B' }}>Total UCs</p>
            <p className="text-lg font-semibold" style={{ color: TEXT_LT }}>{allCollected.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOLD}18` }}>
            <Clock size={18} style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#64748B' }}>Total horas</p>
            <p className="text-lg font-semibold" style={{ color: TEXT_LT }}>{totalHoras.toLocaleString()} hrs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOLD}18` }}>
            <Layers size={18} style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#64748B' }}>Ejes curriculares</p>
            <p className="text-lg font-semibold" style={{ color: TEXT_LT }}>{ejesUnicos.length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#64748B' }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, código, eje o módulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: NAVY,
              color: TEXT_LT,
              border: `1px solid rgba(212,175,55,0.2)`,
            }}
          />
        </div>

        <select
          value={filterEje}
          onChange={(e) => setFilterEje(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: NAVY,
            color: TEXT_LT,
            border: `1px solid rgba(212,175,55,0.2)`,
          }}
        >
          <option value="">Todos los ejes</option>
          {ejesUnicos.map((eje) => (
            <option key={eje} value={eje} style={{ backgroundColor: NAVY }}>{eje}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: 'transparent', color: DIM_LT, border: `1px solid rgba(212,175,55,0.2)` }}
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: DIM_LT }}>
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
          Cargando unidades de competencia...
        </div>
      ) : error ? (
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY, border: `1px solid rgba(239,68,68,0.3)` }}>
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#FCA5A5' }} />
          <p style={{ color: '#FCA5A5' }}>Error al cargar los datos</p>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{error}</p>
          <button
            onClick={() => { setUsandoLocal(true); setError(null); fetchData() }}
            className="mt-4 text-sm underline"
            style={{ color: GOLD }}
          >
            Reintentar con datos locales
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
          <Filter size={32} className="mx-auto mb-3" style={{ color: '#64748B' }} />
          <p style={{ color: DIM_LT }}>
            {hasFilters ? 'No hay resultados con los filtros actuales.' : 'No se encontraron unidades de competencia.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm underline" style={{ color: GOLD }}>
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((group) => (
            <div key={group.id}>
              <div
                className="flex items-center gap-3 mb-3 px-4 py-2 rounded-lg"
                style={{ backgroundColor: NAVY, borderLeft: `4px solid ${group.color || GOLD}` }}
              >
                <h2 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '18px' }}>
                  {group.nombre}
                </h2>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: `${GOLD}18`, color: GOLD }}
                >
                  {group.ucs.length} UC{group.ucs.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {group.ucs.map((uc, idx) => {
                  const ucKey = uc.id || `${uc._semestreId}-${uc.codigo || uc.nombre}-${uc._source}-${uc._moduloCodigo}-${idx}`
                  const isExpanded = expandedUCs.has(ucKey)
                  const horasVal = uc.horas_totales || uc.horas || 0

                  return (
                    <div
                      key={ucKey}
                      className="rounded-lg overflow-hidden transition-all"
                      style={{
                        backgroundColor: NAVY,
                        border: `1px solid rgba(212,175,55,0.12)`,
                      }}
                    >
                      <button
                        onClick={() => toggleExpand(ucKey)}
                        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          style={{ backgroundColor: uc._ejeColor || GOLD }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-mono font-bold text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${GOLD}15`,
                                color: GOLD,
                              }}
                            >
                              {uc.codigo}
                            </span>
                          </div>

                          <h3
                            className="font-heading font-semibold leading-snug mb-1.5"
                            style={{ color: TEXT_LT, fontSize: '14px' }}
                          >
                            {uc.nombre}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="text-xs" style={{ color: CODE_LT }}>
                              {uc._ejeNombre}
                            </span>
                            <span className="text-xs" style={{ color: '#64748B' }}>
                              {uc._moduloNombre}
                            </span>
                            <span
                              className="text-xs font-medium px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${GOLD}12`, color: GOLD }}
                            >
                              {horasVal} hrs
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          {isExpanded
                            ? <ChevronDown size={18} style={{ color: GOLD }} />
                            : <ChevronRight size={18} style={{ color: DIM_LT }} />
                          }
                        </div>
                      </button>

                      {isExpanded && (
                        <div
                          className="px-4 pb-4 pt-0 space-y-3"
                          style={{
                            borderTop: `1px solid rgba(212,175,55,0.08)`,
                            backgroundColor: `${NAVY_MID}30`,
                          }}
                        >
                          {(uc.competencia_general || uc.competenciaGeneral) && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: GOLD }}>
                                Competencia General
                              </p>
                              <p className="text-sm leading-relaxed" style={{ color: DIM_LT }}>
                                {uc.competencia_general || uc.competenciaGeneral}
                              </p>
                            </div>
                          )}

                          {((uc.unidades_aprendizaje && uc.unidades_aprendizaje.length > 0) ||
                            (uc.unidadesAprendizaje && uc.unidadesAprendizaje.length > 0)) && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: GOLD }}>
                                Unidades de Aprendizaje
                              </p>
                              <div className="space-y-1.5">
                                {(uc.unidades_aprendizaje || uc.unidadesAprendizaje || []).map((ua, idx2) => (
                                  <div
                                    key={ua.numero || idx2}
                                    className="flex items-center justify-between py-1 px-2 rounded text-sm"
                                    style={{ backgroundColor: `${NAVY_MID}60` }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="font-mono text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${GOLD}20`, color: GOLD }}
                                      >
                                        {ua.numero || idx2 + 1}
                                      </span>
                                      <span style={{ color: TEXT_LT }}>{ua.titulo}</span>
                                    </div>
                                    {ua.horas != null && (
                                      <span className="text-xs shrink-0" style={{ color: CODE_LT }}>
                                        {ua.horas} hrs
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(uc.bibliografia && uc.bibliografia.length > 0) && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: GOLD }}>
                                Bibliografía
                              </p>
                              <div className="space-y-1">
                                {uc.bibliografia.map((ref, idx3) => (
                                  <div
                                    key={idx3}
                                    className="flex items-start gap-2 text-xs py-1 px-2 rounded"
                                    style={{ backgroundColor: `${NAVY_MID}60` }}
                                  >
                                    <span
                                      className="px-1.5 py-0.5 rounded shrink-0 font-medium"
                                      style={{
                                        backgroundColor: ref.tipo === 'Básica' ? `${GOLD}20` : '#5A6B7C30',
                                        color: ref.tipo === 'Básica' ? GOLD : CODE_LT,
                                      }}
                                    >
                                      {ref.tipo || 'Ref'}
                                    </span>
                                    <span style={{ color: DIM_LT, lineHeight: '1.5' }}>
                                      {ref.referencia}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
