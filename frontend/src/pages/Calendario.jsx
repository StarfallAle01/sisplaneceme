import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Calendar, Clock,
  MapPin, Loader2, AlertCircle, X,
} from 'lucide-react'
import {
  isWeekend, isWorkday, dateToString,
  getDaysInMonth, getFirstDayOfMonth,
} from '../data/calendarData'
import api from '../services/api'

const NAVY      = '#0A1628'
const NAVY_LT   = '#112240'
const NAVY_MID  = '#2B4C7A'
const GOLD      = '#C5A028'
const TEXT_LT   = '#E2E8F0'
const DIM_LT    = '#94A3B8'

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const TIPO_COLORS = {
  clase:   '#3B82F6',
  taller:  '#10B981',
  examen:  '#F59E0B',
  feriado: '#EF4444',
  otro:    '#8B5CF6',
}

const TIPO_LABELS = {
  clase:   'Clase',
  taller:  'Taller',
  examen:  'Examen',
  feriado: 'Feriado',
  otro:    'Otro',
}

const FALLBACK_SEMESTRES = [
  { id: 1, numero: 1, nombre: 'Semestre 1' },
  { id: 2, numero: 2, nombre: 'Semestre 2' },
  { id: 3, numero: 3, nombre: 'Semestre 3' },
  { id: 4, numero: 4, nombre: 'Semestre 4' },
]

function generateMonths(year) {
  return MONTH_NAMES.map((name, i) => ({ year, month: i, label: `${name} ${year}` }))
}

function formatDateLong(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-BO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
}

export default function Calendario() {
  const [mallaActiva, setMallaActiva]         = useState(null)
  const [semestres, setSemestres]             = useState([])
  const [selectedSemestreId, setSelectedSemestreId] = useState('')
  const [eventos, setEventos]                 = useState([])
  const [loading, setLoading]                 = useState(true)
  const [initialLoading, setInitialLoading]   = useState(true)
  const [error, setError]                     = useState(null)
  const [currentYear, setCurrentYear]         = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth]       = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay]         = useState(null)

  const months        = useMemo(() => generateMonths(currentYear), [currentYear])
  const semestreInfo  = useMemo(
    () => semestres.find(s => String(s.id) === String(selectedSemestreId)) || null,
    [semestres, selectedSemestreId],
  )

  const fetchMallaActiva = useCallback(async () => {
    try {
      setError(null)
      const { data } = await api.get('/mallas')
      const mallas = Array.isArray(data) ? data : []
      const activa = mallas.find(m => m.estado === 'activo') || mallas[0] || null
      setMallaActiva(activa)
      return activa
    } catch (err) {
      setError(err.message || 'Error al cargar la malla curricular')
      return null
    }
  }, [])

  const fetchSemestres = useCallback(async (mallaId) => {
    if (!mallaId) return
    try {
      const { data } = await api.get(`/mallas/${mallaId}/semestres`)
      const arr = Array.isArray(data) ? data : (data?.data ?? [])
      if (arr.length === 0) {
        setSemestres(FALLBACK_SEMESTRES)
        setSelectedSemestreId(String(FALLBACK_SEMESTRES[0].id))
      } else {
        setSemestres(arr)
        setSelectedSemestreId(String(arr[0].id))
      }
    } catch (err) {
      setSemestres(FALLBACK_SEMESTRES)
      setSelectedSemestreId(String(FALLBACK_SEMESTRES[0].id))
      setError(err.message || 'Error al cargar los semestres')
    }
  }, [])

  const fetchEventos = useCallback(async (semestreId) => {
    if (!semestreId) {
      setEventos([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/calendario', { params: { semestre_id: semestreId } })
      setEventos(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (err) {
      setError(err.message || 'Error al cargar eventos')
      setEventos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const activa = await fetchMallaActiva()
      if (activa) {
        await fetchSemestres(activa.id)
      } else {
        setSemestres(FALLBACK_SEMESTRES)
        setSelectedSemestreId(String(FALLBACK_SEMESTRES[0].id))
      }
      setInitialLoading(false)
    }
    init()
  }, [fetchMallaActiva, fetchSemestres])

  useEffect(() => {
    if (selectedSemestreId) {
      fetchEventos(selectedSemestreId)
    } else {
      setEventos([])
      setLoading(false)
    }
  }, [selectedSemestreId, fetchEventos])

  const currentMonthData = months[currentMonth]

  const today = useMemo(() => {
    const now = new Date()
    return dateToString(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const eventosPorDia = useMemo(() => {
    const map = {}
    eventos.forEach(ev => {
      const dateStr = ev.fecha ? ev.fecha.slice(0, 10) : null
      if (!dateStr) return
      if (!map[dateStr]) map[dateStr] = []
      map[dateStr].push(ev)
    })
    return map
  }, [eventos])

  const eventosDelMes = useMemo(() => {
    if (!currentMonthData) return []
    return eventos
      .filter(ev => {
        if (!ev.fecha) return false
        const dateStr = ev.fecha.slice(0, 10)
        const [y, m] = dateStr.split('-').map(Number)
        return (
          y === currentMonthData.year &&
          (m - 1) === currentMonthData.month
        )
      })
      .sort((a, b) => {
        const da = a.fecha ? a.fecha.slice(0, 10) : ''
        const db = b.fecha ? b.fecha.slice(0, 10) : ''
        return da.localeCompare(db)
      })
  }, [eventos, currentMonthData])

  const calendarCells = useMemo(() => {
    if (!currentMonthData) return []
    const { year, month } = currentMonthData
    const days   = getDaysInMonth(year, month)
    const offset = getFirstDayOfMonth(year, month)
    const total  = Math.ceil((offset + days) / 7) * 7
    return Array.from({ length: total }, (_, i) => {
      const d = i - offset + 1
      return d >= 1 && d <= days
        ? dateToString(year, month, d)
        : null
    })
  }, [currentMonthData])

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return []
    return eventosPorDia[selectedDay] || []
  }, [selectedDay, eventosPorDia])

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(y => y - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth(m => m - 1)
    }
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(y => y + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth(m => m + 1)
    }
    setSelectedDay(null)
  }

  if (initialLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100vh - 200px)' }}
      >
        <div className="text-center">
          <Loader2
            size={44}
            className="mx-auto mb-4 animate-spin"
            style={{ color: GOLD }}
          />
          <p style={{ color: DIM_LT, fontSize: '15px' }}>
            Cargando calendario académico...
          </p>
        </div>
      </div>
    )
  }

  if (!mallaActiva) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100vh - 200px)' }}
      >
        <div
          className="text-center max-w-md rounded-xl p-10"
          style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}15` }}
        >
          <Calendar size={48} className="mx-auto mb-4" style={{ color: GOLD, opacity: 0.35 }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: TEXT_LT }}>
            No hay malla curricular activa
          </h2>
          <p style={{ color: DIM_LT, fontSize: '14px', lineHeight: '1.6' }}>
            No se encontró una malla curricular en estado activo.
            Contacte al administrador del sistema para configurar la malla.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ═══════════════ HEADER ════════════════════════════════════════════ */}
      <div
        className="rounded-xl px-7 py-6"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LT} 100%)`,
          border: `1px solid ${GOLD}18`,
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="font-heading font-bold tracking-tight"
              style={{ color: GOLD, fontSize: '26px', lineHeight: '1.2' }}
            >
              Calendario Académico
            </h1>
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              {semestreInfo && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${GOLD}1A`,
                    color: GOLD,
                    border: `1px solid ${GOLD}35`,
                  }}
                >
                  <Calendar size={12} />
                  {semestreInfo.nombre || `Semestre ${semestreInfo.numero || semestreInfo.id}`}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5" style={{ color: DIM_LT, fontSize: '13px' }}>
                <MapPin size={12} style={{ opacity: 0.6 }} />
                {mallaActiva.nombre || 'Malla Curricular'}
              </span>
              <span style={{ color: `${DIM_LT}99`, fontSize: '13px' }}>
                · {eventos.length} evento{eventos.length !== 1 ? 's' : ''} registrado{eventos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ ERROR BANNER ══════════════════════════════════════ */}
      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: '#7F1D1D12',
            border: '1px solid #7F1D1D2A',
            color: '#FCA5A5',
          }}
        >
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => {
              setError(null)
              if (selectedSemestreId) fetchEventos(selectedSemestreId)
            }}
            className="text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-white/5"
            style={{ color: '#FCA5A5' }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ═══════════════ CONTROLS ══════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <select
          value={selectedSemestreId}
          onChange={(e) => {
            setSelectedSemestreId(e.target.value)
            setSelectedDay(null)
          }}
          disabled={semestres.length === 0}
          className="px-4 py-2.5 rounded-lg outline-none text-sm font-medium min-w-[220px] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: NAVY,
            color: TEXT_LT,
            border: `1px solid ${GOLD}2A`,
          }}
          onFocus={(e) => (e.target.style.borderColor = GOLD)}
          onBlur={(e) => (e.target.style.borderColor = `${GOLD}2A`)}
        >
          {semestres.length === 0 && (
            <option value="" style={{ backgroundColor: NAVY }}>
              Sin semestres disponibles
            </option>
          )}
          {semestres.map((sem) => (
            <option key={sem.id} value={sem.id} style={{ backgroundColor: NAVY }}>
              {sem.nombre || `Semestre ${sem.numero || sem.id}`}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-2.5 rounded-lg transition-all"
            style={{
              backgroundColor: NAVY,
              border: `1px solid ${GOLD}20`,
              color: TEXT_LT,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = NAVY_MID
              e.currentTarget.style.borderColor = GOLD
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = NAVY
              e.currentTarget.style.borderColor = `${GOLD}20`
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <h2
            className="text-center select-none"
            style={{
              color: GOLD,
              minWidth: '200px',
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.5px',
            }}
          >
            {currentMonthData?.label || '—'}
          </h2>

          <button
            onClick={goToNextMonth}
            className="p-2.5 rounded-lg transition-all"
            style={{
              backgroundColor: NAVY,
              border: `1px solid ${GOLD}20`,
              color: TEXT_LT,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = NAVY_MID
              e.currentTarget.style.borderColor = GOLD
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = NAVY
              e.currentTarget.style.borderColor = `${GOLD}20`
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ═══════════════ CALENDAR GRID ═════════════════════════════════════ */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}12` }}
      >
        {/* Day headers */}
        <div
          className="grid grid-cols-7"
          style={{ borderBottom: `1px solid ${GOLD}0E` }}
        >
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              className="text-center py-3.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: i >= 5 ? `${DIM_LT}70` : GOLD }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={30} className="animate-spin" style={{ color: GOLD }} />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarCells.map((dateStr, idx) => {
              if (!dateStr) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      minHeight: '104px',
                      borderBottom: `1px solid ${GOLD}05`,
                      borderRight: (idx + 1) % 7 !== 0 ? `1px solid ${GOLD}05` : 'none',
                    }}
                  />
                )
              }

              const weekend     = isWeekend(dateStr)
              const isToday     = dateStr === today
              const isSelected  = dateStr === selectedDay
              const dayNum      = parseInt(dateStr.slice(8), 10)
              const dayEvents   = eventosPorDia[dateStr] || []
              const hasFeriado  = dayEvents.some(e => e.tipo === 'feriado')
              const isLastCol   = (idx + 1) % 7 === 0
              const isLastRow   = idx >= calendarCells.length - 7

              let cellBg = NAVY
              if (weekend)      cellBg = '#0C1B2E'
              if (hasFeriado)   cellBg = '#1A0E15'
              if (isSelected)   cellBg = NAVY_MID

              let numColor = TEXT_LT
              if (weekend)  numColor = `${DIM_LT}70`

              const tiposPresent = [...new Set(dayEvents.map(e => e.tipo).filter(Boolean))]

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className="relative flex flex-col items-start p-2.5 transition-colors text-left w-full"
                  style={{
                    backgroundColor: cellBg,
                    minHeight: '104px',
                    borderBottom: isLastRow ? 'none' : `1px solid ${GOLD}05`,
                    borderRight: isLastCol ? 'none' : `1px solid ${GOLD}05`,
                    outline: isToday ? `2px solid ${GOLD}55` : 'none',
                    outlineOffset: '-2px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = hasFeriado
                        ? '#25131C'
                        : weekend ? '#111F33' : NAVY_LT
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = cellBg
                    }
                  }}
                >
                  {/* Day number */}
                  <span
                    className="text-xs font-bold leading-none mb-2"
                    style={{
                      color: isToday ? GOLD : numColor,
                      backgroundColor: isToday ? `${GOLD}1A` : 'transparent',
                      padding: isToday ? '1px 6px' : '0',
                      borderRadius: isToday ? '9999px' : '0',
                    }}
                  >
                    {dayNum}
                  </span>

                  {/* Event type dots */}
                  {tiposPresent.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tiposPresent.slice(0, 5).map(tipo => (
                        <span
                          key={tipo}
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: TIPO_COLORS[tipo] || '#6B7280',
                            boxShadow: `0 0 4px ${TIPO_COLORS[tipo] || '#6B7280'}55`,
                          }}
                          title={TIPO_LABELS[tipo] || tipo}
                        />
                      ))}
                    </div>
                  )}

                  {/* Event count badge */}
                  {dayEvents.length > 0 && (
                    <span
                      className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${GOLD}12`,
                        color: GOLD,
                        lineHeight: '1',
                      }}
                    >
                      {dayEvents.length}
                    </span>
                  )}

                  {/* Holiday label */}
                  {hasFeriado && tiposPresent.length <= 1 && (
                    <span
                      className="text-[9px] mt-1 font-medium"
                      style={{ color: TIPO_COLORS.feriado, opacity: 0.8 }}
                    >
                      Feriado
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══════════════ SELECTED DAY PANEL ════════════════════════════════ */}
      {selectedDay && (
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: NAVY,
            border: `1px solid ${GOLD}1E`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-heading text-base font-semibold capitalize"
              style={{ color: GOLD }}
            >
              {formatDateLong(selectedDay)}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: DIM_LT }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_LT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
            >
              <X size={18} />
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="flex items-center gap-2 py-3" style={{ color: DIM_LT, fontSize: '14px' }}>
              <Calendar size={16} style={{ opacity: 0.5 }} />
              Sin eventos programados para este día.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map(ev => (
                <div
                  key={ev.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: NAVY_LT,
                    border: `1px solid ${GOLD}08`,
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 mt-1"
                    style={{
                      backgroundColor: ev.color || TIPO_COLORS[ev.tipo] || '#6B7280',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: TEXT_LT, lineHeight: '1.4' }}
                    >
                      {ev.titulo}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {ev.tipo && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-semibold"
                          style={{
                            backgroundColor: `${TIPO_COLORS[ev.tipo] || '#6B7280'}1A`,
                            color: TIPO_COLORS[ev.tipo] || '#6B7280',
                          }}
                        >
                          {TIPO_LABELS[ev.tipo] || ev.tipo}
                        </span>
                      )}
                      {ev.horas != null && (
                        <span
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: DIM_LT }}
                        >
                          <Clock size={11} />
                          {ev.horas}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ MONTH EVENTS LIST ═════════════════════════════════ */}
      {!loading && eventosDelMes.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}12` }}
        >
          <h3
            className="font-heading text-base font-semibold mb-4"
            style={{ color: GOLD }}
          >
            Eventos de {currentMonthData?.label?.split(' ')[0] || 'este mes'}
            <span
              className="ml-2 text-xs font-normal"
              style={{ color: DIM_LT }}
            >
              ({eventosDelMes.length})
            </span>
          </h3>

          <div className="space-y-1">
            {eventosDelMes.map(ev => (
              <div
                key={ev.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = NAVY_LT)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: ev.color || TIPO_COLORS[ev.tipo] || '#6B7280',
                  }}
                />
                <span
                  className="text-xs font-mono shrink-0"
                  style={{ color: DIM_LT, minWidth: '28px' }}
                >
                  {formatDateShort(ev.fecha)}
                </span>
                <span className="flex-1 text-sm truncate" style={{ color: TEXT_LT }}>
                  {ev.titulo}
                </span>
                {ev.tipo && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 hidden sm:inline-flex"
                    style={{
                      backgroundColor: `${TIPO_COLORS[ev.tipo] || '#6B7280'}16`,
                      color: TIPO_COLORS[ev.tipo] || '#6B7280',
                    }}
                  >
                    {TIPO_LABELS[ev.tipo] || ev.tipo}
                  </span>
                )}
                {ev.horas != null && (
                  <span
                    className="flex items-center gap-1 text-xs shrink-0"
                    style={{ color: DIM_LT, minWidth: '34px', justifyContent: 'flex-end' }}
                  >
                    <Clock size={11} />
                    {ev.horas}h
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ EMPTY MONTH ═══════════════════════════════════════ */}
      {!loading && selectedSemestreId && eventosDelMes.length === 0 && (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}0E` }}
        >
          <Calendar size={40} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.25 }} />
          <p style={{ color: DIM_LT, fontSize: '14px' }}>
            No hay eventos en {currentMonthData?.label || 'este mes'} para el semestre seleccionado.
          </p>
        </div>
      )}

      {/* ═══════════════ LEGEND ════════════════════════════════════════════ */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}0E` }}
      >
        <h3
          className="font-heading text-sm font-semibold mb-3.5"
          style={{ color: GOLD }}
        >
          Leyenda
        </h3>
        <div className="flex flex-wrap gap-x-5 gap-y-2.5">
          {Object.entries(TIPO_COLORS).map(([tipo, color]) => (
            <div key={tipo} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 5px ${color}40`,
                }}
              />
              <span className="text-xs font-medium" style={{ color: DIM_LT }}>
                {TIPO_LABELS[tipo]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
