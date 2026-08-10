import { useState, useEffect, useCallback } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import api from '../../services/api'
import {
  Plus, Edit, Trash2, X, Save, Loader2,
  AlertCircle, CheckCircle2, Calendar as CalendarIcon,
  Filter, ChevronLeft, ChevronRight, Layers,
} from 'lucide-react'

const NAVY    = '#0A1628'
const NAVY_MID = '#2B4C7A'
const GOLD    = '#C5A028'
const TEXT_LT = '#E2E8F0'
const DIM_LT  = '#94A3B8'

const TIPO_EVENTO = ['clase', 'taller', 'examen', 'feriado', 'otro']

const TIPO_COLORS = {
  clase:   '#3B82F6',
  taller:  '#10B981',
  examen:  '#F59E0B',
  feriado: '#EF4444',
  otro:    '#6B7280',
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

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function monthGrid(year, month, events, TIPO_COLORS) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const totalDays = lastDay.getDate()
  let startDow = firstDay.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  const eventsByDay = {}
  events.forEach((ev) => {
    const parts = ev.fecha ? ev.fecha.slice(0, 10).split('-') : null
    if (!parts || parts.length !== 3) return
    const y = parseInt(parts[0])
    const m = parseInt(parts[1]) - 1
    const d = parseInt(parts[2])
    if (y === year && m === month) {
      if (!eventsByDay[d]) eventsByDay[d] = []
      eventsByDay[d].push(ev)
    }
  })

  const cells = []
  for (let i = 0; i < startDow; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push(d)
  }

  return { cells, totalDays, eventsByDay }
}

export default function GestionCalendario() {
  const { canWrite } = usePermissions()

  const [mallaActiva, setMallaActiva]   = useState(null)
  const [mallaNotFound, setMallaNotFound] = useState(false)
  const [semestres, setSemestres]       = useState([])
  const [selectedSemestre, setSelectedSemestre] = useState('')
  const [eventos, setEventos]           = useState([])
  const [ucMap, setUcMap]               = useState({})
  const [loading, setLoading]           = useState(true)
  const [initError, setInitError]       = useState(null)
  const [error, setError]               = useState(null)
  const [success, setSuccess]           = useState(null)

  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({
    titulo: '', fecha: '', horas: 2, tipo: 'clase',
    color: '#3B82F6', unidad_competencia_id: '',
  })

  const [batchOpen, setBatchOpen]   = useState(false)
  const [batchEntries, setBatchEntries] = useState([])
  const [batchUcs, setBatchUcs]     = useState([])
  const [batchSaving, setBatchSaving] = useState(false)
  const [batchForm, setBatchForm]   = useState({
    ucId: '', fechaInicio: '', fechaFin: '', tipo: 'clase',
  })

  const flashSuccess = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 4000)
  }

  const fetchMallaActiva = useCallback(async () => {
    try {
      setInitError(null)
      const { data } = await api.get('/mallas')
      const mallas = Array.isArray(data) ? data : (data?.data ?? [])
      const activa = mallas.find(m => m.estado === 'activo') || mallas[0] || null
      if (!activa) {
        setMallaNotFound(true)
        setLoading(false)
        return null
      }
      setMallaNotFound(false)
      setMallaActiva(activa)
      return activa
    } catch (err) {
      console.error('Error al cargar mallas:', err)
      setInitError('No se pudo cargar la malla activa.')
      setLoadFallbackSemestres()
      setLoading(false)
      return null
    }
  }, [])

  const setLoadFallbackSemestres = () => {
    setSemestres(FALLBACK_SEMESTRES)
  }

  const fetchSemestres = useCallback(async (mallaId) => {
    if (!mallaId) return
    try {
      const { data } = await api.get(`/mallas/${mallaId}/semestres`)
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      if (list.length === 0) {
        console.warn('No se encontraron semestres via API, usando valores de respaldo.')
        setSemestres(FALLBACK_SEMESTRES)
      } else {
        setSemestres(list)
      }
    } catch (err) {
      console.error('Error al cargar semestres:', err)
      setSemestres(FALLBACK_SEMESTRES)
    }
  }, [])

  const fetchEventos = useCallback(async (semestreId) => {
    if (!semestreId) return
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/calendario', { params: { semestre_id: semestreId } })
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      setEventos(list)

      if (list.length > 0) {
        const fechas = list
          .map(e => e.fecha ? new Date(e.fecha.slice(0, 10) + 'T00:00:00') : null)
          .filter(Boolean)
        if (fechas.length > 0) {
          fechas.sort((a, b) => a - b)
          setCalendarYear(fechas[0].getFullYear())
          setCalendarMonth(fechas[0].getMonth())
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUCs = useCallback(async (mallaId) => {
    if (!mallaId) return
    try {
      const { data } = await api.get(`/mallas/${mallaId}/completa`)
      let tree = data?.data || data || {}
      if (tree && typeof tree === 'object' && !Array.isArray(tree) && tree.data && !tree.semestres) {
        tree = tree.data
      }
      const sems = Array.isArray(tree) ? tree : (tree.semestres || [])
      const map = {}
      sems.forEach(sem => {
        const ejes = sem.ejes_curriculares || sem.ejes || []
        const trans = sem.transversales || []
        ;[...ejes, ...trans].forEach(eje => {
          const mods = eje.modulos || []
          mods.forEach(mod => {
            const ucs = mod.unidades_competencia || []
            ucs.forEach(uc => { if (uc.id) map[uc.id] = uc })
          })
        })
      })
      setUcMap(map)
    } catch (err) {
      console.error('Error fetching UCs for cross-reference:', err)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const activa = await fetchMallaActiva()
      if (activa) {
        await fetchSemestres(activa.id)
        fetchUCs(activa.id)
      }
      setLoading(false)
    }
    init()
  }, [fetchMallaActiva, fetchSemestres, fetchUCs])

  useEffect(() => {
    if (selectedSemestre) {
      fetchEventos(selectedSemestre)
    }
  }, [selectedSemestre, fetchEventos])

  const openCreate = () => {
    setEditItem(null)
    setForm({
      titulo: '', fecha: '', horas: 2, tipo: 'clase',
      color: '#3B82F6', unidad_competencia_id: '',
    })
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (evento) => {
    setEditItem(evento)
    setForm({
      titulo: evento.titulo || '',
      fecha: evento.fecha ? evento.fecha.slice(0, 10) : '',
      horas: evento.horas || 2,
      tipo: evento.tipo || 'clase',
      color: evento.color || '#3B82F6',
      unidad_competencia_id: evento.unidad_competencia_id || '',
    })
    setError(null)
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      const payload = {
        ...form,
        semestre_id: parseInt(selectedSemestre),
        horas: parseInt(form.horas) || 0,
        unidad_competencia_id: form.unidad_competencia_id ? parseInt(form.unidad_competencia_id) : null,
      }

      if (editItem) {
        await api.put(`/calendario/${editItem.id}`, payload)
      } else {
        await api.post('/calendario', payload)
      }

      setModalOpen(false)
      fetchEventos(selectedSemestre)
      flashSuccess(editItem ? 'Evento actualizado exitosamente.' : 'Evento creado exitosamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este evento permanentemente? Esta accion no se puede deshacer.')) return
    try {
      await api.delete(`/calendario/${id}`)
      fetchEventos(selectedSemestre)
      flashSuccess('Evento eliminado exitosamente.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-BO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
  }

  const isToday = (year, month, day) => {
    const now = new Date()
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
  }

  const fetchUCsParaSemestre = async (semestreId) => {
    if (!mallaActiva || !semestreId) return
    try {
      const { data } = await api.get(`/mallas/${mallaActiva.id}/completa`)
      const tree = data?.data || data || {}
      const sems = tree.semestres || (Array.isArray(tree) ? tree : [])
      const sem = Array.isArray(sems) ? sems.find(s => s.id == semestreId) : null
      if (!sem) return
      const list = []
      ;(sem.ejes_curriculares || []).forEach(eje => {
        ;(eje.modulos || []).forEach(mod => {
          ;(mod.unidades_competencia || []).forEach(uc => list.push(uc))
        })
      })
      if (sem.transversales) {
        const tx = Array.isArray(sem.transversales) ? sem.transversales : [sem.transversales]
        tx.forEach(t => (t.unidades_competencia || []).forEach(uc => list.push(uc)))
      }
      setBatchUcs(list)
    } catch (_) { setBatchUcs([]) }
  }

  const openBatchModal = () => {
    if (!selectedSemestre) return
    setBatchForm({ ucId: '', fechaInicio: '', fechaFin: '', tipo: 'clase' })
    setBatchEntries([])
    setBatchOpen(true)
    fetchUCsParaSemestre(selectedSemestre)
  }

  const addToBatch = () => {
    if (!batchForm.fechaInicio || !batchForm.fechaFin || !batchForm.tipo) {
      setError('Completa fecha inicio, fecha fin y tipo.')
      return
    }
    const ini = new Date(batchForm.fechaInicio + 'T12:00:00')
    const fin = new Date(batchForm.fechaFin + 'T12:00:00')
    if (fin < ini) { setError('La fecha fin debe ser posterior a la fecha inicio.'); return }
    const ucSel = batchUcs.find(u => u.id == batchForm.ucId)
    const titulo = ucSel ? (ucSel.codigo || ucSel.nombre) : (batchForm.tipo === 'feriado' ? 'FERIADO' : 'Clase')
    const colorSel = batchForm.tipo === 'feriado' ? '#EF4444' : '#3B82F6'
    const nuevas = []
    const cursor = new Date(ini)
    while (cursor <= fin) {
      const dateStr = cursor.toISOString().slice(0, 10)
      const yaExiste = batchEntries.some(e => e.fecha === dateStr) ||
        eventos.some(e => e.fecha && e.fecha.slice(0, 10) === dateStr)
      if (!yaExiste) {
        nuevas.push({
          _key: `${dateStr}-${Math.random().toString(36).slice(2, 6)}`,
          titulo,
          fecha: dateStr,
          horas: 6,
          tipo: batchForm.tipo,
          color: colorSel,
          semestre_id: parseInt(selectedSemestre),
          unidad_competencia_id: batchForm.ucId ? parseInt(batchForm.ucId) : null,
        })
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    if (nuevas.length === 0) { setError('No hay días nuevos para agregar en ese rango.'); return }
    setBatchEntries(prev => [...prev, ...nuevas])
    setError(null)
  }

  const removeFromBatch = (key) => {
    setBatchEntries(prev => prev.filter(e => e._key !== key))
  }

  const saveBatch = async () => {
    if (batchEntries.length === 0) return
    try {
      setBatchSaving(true)
      setError(null)
      const payload = batchEntries.map(({ _key, ...ev }) => ev)
      const { data } = await api.post('/calendario/lote', { eventos: payload })
      flashSuccess(`${data.creados} eventos creados exitosamente.`)
      setBatchEntries([])
      setBatchOpen(false)
      fetchEventos(selectedSemestre)
    } catch (err) {
      setError(err.message)
    } finally {
      setBatchSaving(false)
    }
  }

  const handleBatchChange = (e) => {
    const { name, value } = e.target
    setBatchForm(prev => ({ ...prev, [name]: value }))
  }

  const { cells, eventsByDay } = monthGrid(calendarYear, calendarMonth, eventos, TIPO_COLORS)

  const goPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setCalendarYear(y => y - 1)
    } else {
      setCalendarMonth(m => m - 1)
    }
  }

  const goNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setCalendarYear(y => y + 1)
    } else {
      setCalendarMonth(m => m + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '28px' }}>
          Gestion de Calendario Academico
        </h1>
        <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
          {canWrite ? 'Crear, editar y gestionar eventos del calendario' : 'Vista de eventos del calendario'}
        </p>
      </div>

      {initError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#F59E0B20', border: '1px solid #F59E0B40', color: '#FCD34D' }}>
          <AlertCircle size={16} /> {initError}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#7F1D1D20', border: '1px solid #7F1D1D40', color: '#FCA5A5' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#05966920', border: '1px solid #05966940', color: '#6EE7B7' }}>
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {mallaNotFound ? (
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
          <CalendarIcon size={48} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
          <p className="text-lg font-medium" style={{ color: TEXT_LT }}>No se encontro una malla activa</p>
          <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '6px' }}>
            Registra una malla en el sistema para gestionar el calendario.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={16} style={{ color: DIM_LT }} />
              <select
                value={selectedSemestre}
                onChange={(e) => setSelectedSemestre(e.target.value)}
                className="px-4 py-2.5 rounded-lg outline-none text-sm min-w-[200px]"
                style={{
                  backgroundColor: '#ffffff0A', color: TEXT_LT,
                  border: `1px solid ${GOLD}30`,
                }}
              >
                <option value="" style={{ backgroundColor: NAVY }}>Seleccionar semestre...</option>
                {semestres.map((sem) => (
                  <option key={sem.id} value={sem.id} style={{ backgroundColor: NAVY }}>
                    {sem.nombre || `Semestre ${sem.numero || sem.id}`}
                  </option>
                ))}
              </select>
            </div>

            {canWrite && (
              <>
                <button
                  onClick={openCreate}
                  disabled={!selectedSemestre}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                  style={{ backgroundColor: GOLD, color: NAVY }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = '#D4B84C'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = 'translateY(0)' } }}
                >
                  <Plus size={16} /> Nuevo Evento
                </button>
                <button
                  onClick={openBatchModal}
                  disabled={!selectedSemestre}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                  style={{ backgroundColor: NAVY_MID, color: GOLD, border: `1px solid ${GOLD}40` }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = '#2A4A6F'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = NAVY_MID; e.currentTarget.style.transform = 'translateY(0)' } }}
                >
                  <Layers size={16} /> Crear por Lote
                </button>
              </>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20" style={{ color: DIM_LT }}>
              <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
              Cargando eventos...
            </div>
          ) : !selectedSemestre ? (
            <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
              <CalendarIcon size={48} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
              <p className="text-lg font-medium" style={{ color: TEXT_LT }}>Selecciona un semestre para ver los eventos.</p>
              <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '6px' }}>
                {mallaActiva ? `Malla activa: ${mallaActiva.nombre} (${mallaActiva.gestion || mallaActiva.año || '-'})` : 'Usando valores de respaldo.'}
              </p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
              <CalendarIcon size={48} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
              <p className="text-lg font-medium" style={{ color: TEXT_LT }}>No hay eventos registrados para este semestre.</p>
              {canWrite && <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '6px' }}>Crea el primer evento para empezar.</p>}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg p-4" style={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={goPrevMonth}
                    className="p-1 rounded transition-colors"
                    style={{ color: DIM_LT }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-medium" style={{ color: TEXT_LT }}>
                    {MESES[calendarMonth]} {calendarYear}
                  </span>
                  <button
                    onClick={goNextMonth}
                    className="p-1 rounded transition-colors"
                    style={{ color: DIM_LT }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {DIAS_SEMANA.map((d) => (
                    <div key={d} className="text-center text-xs font-medium py-1" style={{ color: DIM_LT }}>
                      {d}
                    </div>
                  ))}
                  {cells.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="rounded min-h-[50px]" />
                    }
                    const dayEvents = eventsByDay[day] || []
                    const today = isToday(calendarYear, calendarMonth, day)
                    return (
                      <div
                        key={`day-${day}`}
                        className="rounded p-1 text-center min-h-[50px]"
                        style={{
                          backgroundColor: today ? `${GOLD}15` : '#ffffff05',
                          border: today ? `1px solid ${GOLD}40` : '1px solid transparent',
                        }}
                      >
                        <span
                          className="text-xs font-medium"
                          style={{ color: today ? GOLD : TEXT_LT }}
                        >
                          {day}
                        </span>
                        <div className="flex justify-center gap-0.5 mt-1 flex-wrap max-w-full">
                          {dayEvents.slice(0, 3).map((ev, i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: ev.color || TIPO_COLORS[ev.tipo] || '#6B7280' }}
                              title={ev.titulo}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[9px] leading-none" style={{ color: DIM_LT }}>
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-3 flex items-center gap-4 flex-wrap text-xs" style={{ color: DIM_LT }}>
                  {Object.entries(TIPO_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TIPO_COLORS[key] }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.15)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: `${NAVY}CC`, borderBottom: `1px solid ${GOLD}20` }}>
                      <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Fecha</th>
                      <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Titulo</th>
                      <th className="text-center px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Horas</th>
                      <th className="text-center px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Tipo</th>
                      <th className="text-right px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.map((evento) => (
                      <tr
                        key={evento.id}
                        className="transition-colors"
                        style={{ backgroundColor: NAVY, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2B4C7A')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                      >
                        <td className="px-4 py-3">
                          <span style={{ color: TEXT_LT, fontSize: '13px' }}>{formatDate(evento.fecha)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: evento.color || TIPO_COLORS[evento.tipo] || '#6B7280' }}
                            />
                            <p className="font-medium text-sm" style={{ color: TEXT_LT }}>
                              {evento.titulo}
                              {evento.unidad_competencia_id && ucMap[evento.unidad_competencia_id] && (
                                <span style={{ color: DIM_LT, fontSize: '11px', marginLeft: '6px' }}>
                                  ({ucMap[evento.unidad_competencia_id].nombre || ucMap[evento.unidad_competencia_id].codigo})
                                </span>
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span style={{ color: DIM_LT, fontSize: '13px' }}>{evento.horas || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="inline-flex text-[10px] px-2 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${TIPO_COLORS[evento.tipo] || '#6B7280'}20`,
                              color: TIPO_COLORS[evento.tipo] || '#6B7280',
                            }}
                          >
                            {TIPO_LABELS[evento.tipo] || evento.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canWrite && (
                              <>
                                <button
                                  onClick={() => openEdit(evento)}
                                  className="p-2 rounded-lg transition-colors"
                                  style={{ color: DIM_LT }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                                  title="Editar evento"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(evento.id)}
                                  className="p-2 rounded-lg transition-colors"
                                  style={{ color: DIM_LT }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                                  title="Eliminar evento"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-lg rounded-xl overflow-hidden"
              style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}30` }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${GOLD}15` }}>
                <h2 className="font-heading text-lg font-medium" style={{ color: GOLD }}>
                  {editItem ? 'Editar Evento' : 'Nuevo Evento'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded transition-colors"
                  style={{ color: DIM_LT }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_LT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Titulo *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                    style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    placeholder="Ej: Clase de Matematicas"
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Fecha *</label>
                    <input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Horas</label>
                    <input
                      type="number"
                      name="horas"
                      value={form.horas}
                      onChange={handleChange}
                      min="1"
                      max="24"
                      className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Tipo *</label>
                    <select
                      name="tipo"
                      value={form.tipo}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    >
                      {TIPO_EVENTO.map((t) => (
                        <option key={t} value={t} style={{ backgroundColor: NAVY }}>
                          {TIPO_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        style={{ backgroundColor: 'transparent' }}
                      />
                      <input
                        type="text"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                        style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                        placeholder="#3B82F6"
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded text-xs" style={{ backgroundColor: '#7F1D1D20', color: '#FCA5A5' }}>
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm transition-colors"
                    style={{ color: DIM_LT }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {batchOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setBatchOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl"
              style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}30` }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${GOLD}15` }}>
                <h2 className="font-heading text-lg font-medium" style={{ color: GOLD }}>
                  <Layers size={18} className="inline mr-2" style={{ verticalAlign: '-3px' }} />
                  Creacion por Lote
                </h2>
                <button onClick={() => setBatchOpen(false)} className="p-1 rounded transition-colors" style={{ color: DIM_LT }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_LT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}>
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Asignatura</label>
                    <select name="ucId" value={batchForm.ucId} onChange={handleBatchChange}
                      className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}>
                      <option value="" style={{ backgroundColor: NAVY }}>Sin asignatura especifica</option>
                      {batchUcs.map(uc => (
                        <option key={uc.id} value={uc.id} style={{ backgroundColor: NAVY }}>
                          {uc.codigo} — {uc.nombre?.slice(0, 60)}{uc.nombre?.length > 60 ? '...' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Tipo</label>
                    <select name="tipo" value={batchForm.tipo} onChange={handleBatchChange}
                      className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}>
                      <option value="clase" style={{ backgroundColor: NAVY }}>Clase</option>
                      <option value="taller" style={{ backgroundColor: NAVY }}>Taller</option>
                      <option value="examen" style={{ backgroundColor: NAVY }}>Examen</option>
                      <option value="feriado" style={{ backgroundColor: NAVY }}>Feriado</option>
                      <option value="otro" style={{ backgroundColor: NAVY }}>Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Fecha Inicio *</label>
                    <input type="date" name="fechaInicio" value={batchForm.fechaInicio} onChange={handleBatchChange}
                      className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Fecha Fin *</label>
                    <input type="date" name="fechaFin" value={batchForm.fechaFin} onChange={handleBatchChange}
                      className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded text-xs" style={{ backgroundColor: '#7F1D1D20', color: '#FCA5A5' }}>
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button onClick={addToBatch}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all w-full justify-center"
                  style={{ backgroundColor: `${GOLD}20`, color: GOLD, border: `1px solid ${GOLD}30` }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${GOLD}30` }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${GOLD}20` }}>
                  <Plus size={16} /> Agregar al Lote
                </button>

                {batchEntries.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium" style={{ color: TEXT_LT }}>
                        Lote pendiente ({batchEntries.length} evento{batchEntries.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {batchEntries.map((entry) => (
                        <div key={entry._key}
                          className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm"
                          style={{ backgroundColor: '#ffffff08', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: TIPO_COLORS[entry.tipo] || '#6B7280' }} />
                            <div>
                              <span className="font-medium" style={{ color: TEXT_LT }}>{entry.titulo}</span>
                              <span className="ml-2" style={{ color: DIM_LT, fontSize: '12px' }}>
                                {entry.fecha} · {TIPO_LABELS[entry.tipo]}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => removeFromBatch(entry._key)}
                            className="p-1.5 rounded transition-colors shrink-0" style={{ color: DIM_LT }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: `1px solid ${GOLD}15` }}>
                <button onClick={() => { setBatchEntries([]); setBatchOpen(false); }}
                  className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ color: DIM_LT }}>
                  Cancelar
                </button>
                <button onClick={saveBatch} disabled={batchEntries.length === 0 || batchSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{ backgroundColor: GOLD, color: NAVY }}>
                  {batchSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {batchSaving ? 'Guardando...' : `Guardar ${batchEntries.length} evento${batchEntries.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
