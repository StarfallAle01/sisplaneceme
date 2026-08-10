import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import api from '../../services/api'
import { ChevronLeft, Loader2, AlertCircle, Plus, Edit, Trash2, Save, X, Check } from 'lucide-react'

const NAVY    = '#0A1628'
const GOLD    = '#C5A028'
const TEXT_LT = '#E2E8F0'
const DIM_LT  = '#94A3B8'

export default function EditarUnidadCompetencia() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canWrite } = usePermissions()

  const [uc, setUc]                 = useState(null)
  const [elementos, setElementos]   = useState([])
  const [unidadesAp, setUnidadesAp] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [saving, setSaving]         = useState(false)

  // formulario inline para elemento y UA
  const [nuevoElemento, setNuevoElemento] = useState({ titulo: '', descripcion: '' })
  const [elementoEdit, setElementoEdit]   = useState(null) // {id, titulo, descripcion}
  const [nuevaUA, setNuevaUA]             = useState({ titulo: '', contenido_analitico: '', horas: 0 })
  const [uaEdit, setUaEdit]               = useState(null)

  const [formUC, setFormUC] = useState({
    codigo: '', nombre: '', competencia_general: '',
    dias: 0, horas_teoricas: 0, horas_practicas: 0, horas_totales: 0,
  })

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [{ data: ucData }, { data: elems }, { data: uas }] = await Promise.all([
        api.get(`/mallas/unidades-competencia/${id}`),
        api.get(`/mallas/unidades-competencia/${id}/elementos`),
        api.get(`/mallas/unidades-competencia/${id}/aprendizaje`),
      ])
      setUc(ucData)
      setFormUC({
        codigo: ucData.codigo || '',
        nombre: ucData.nombre || '',
        competencia_general: ucData.competencia_general || '',
        dias: ucData.dias ?? 0,
        horas_teoricas: ucData.horas_teoricas ?? 0,
        horas_practicas: ucData.horas_practicas ?? 0,
        horas_totales: ucData.horas_totales ?? 0,
      })
      setElementos(Array.isArray(elems) ? elems : [])
      setUnidadesAp(Array.isArray(uas) ? uas : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ─── UC basic info ───
  const guardarUC = async () => {
    try {
      setSaving(true)
      await api.put(`/mallas/unidades-competencia/${id}`, {
        codigo: formUC.codigo,
        nombre: formUC.nombre,
        competencia_general: formUC.competencia_general || null,
        dias: parseInt(formUC.dias, 10) || 0,
        horas_teoricas: parseInt(formUC.horas_teoricas, 10) || 0,
        horas_practicas: parseInt(formUC.horas_practicas, 10) || 0,
        horas_totales: parseInt(formUC.horas_totales, 10) || 0,
      })
      fetchAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ─── Elementos de Competencia ───
  const agregarElemento = async () => {
    if (!nuevoElemento.titulo.trim()) return
    try {
      await api.post(`/mallas/unidades-competencia/${id}/elementos`, nuevoElemento)
      setNuevoElemento({ titulo: '', descripcion: '' })
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const guardarElemento = async () => {
    if (!elementoEdit?.titulo.trim()) return
    try {
      await api.put(`/mallas/elementos/${elementoEdit.id}`, {
        titulo: elementoEdit.titulo,
        descripcion: elementoEdit.descripcion,
      })
      setElementoEdit(null)
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const eliminarElemento = async (elId) => {
    if (!confirm('Eliminar este elemento? Los números restantes se reordenarán.')) return
    try {
      await api.delete(`/mallas/elementos/${elId}`)
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  // ─── Unidades de Aprendizaje (Contenido Mínimo + Analítico) ───
  const agregarUA = async () => {
    if (!nuevaUA.titulo.trim()) return
    try {
      await api.post(`/mallas/unidades-competencia/${id}/aprendizaje`, {
        titulo: nuevaUA.titulo,
        contenido_analitico: nuevaUA.contenido_analitico || null,
        horas: parseInt(nuevaUA.horas, 10) || 0,
      })
      setNuevaUA({ titulo: '', contenido_analitico: '', horas: 0 })
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const guardarUA = async () => {
    if (!uaEdit?.titulo.trim()) return
    try {
      await api.put(`/mallas/unidades-aprendizaje/${uaEdit.id}`, {
        titulo: uaEdit.titulo,
        contenido_analitico: uaEdit.contenido_analitico,
        horas: parseInt(uaEdit.horas, 10) || 0,
      })
      setUaEdit(null)
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const eliminarUA = async (uaId) => {
    if (!confirm('Eliminar esta Unidad de Aprendizaje? Los números restantes se reordenarán y también se eliminará su bibliografía.')) return
    try {
      await api.delete(`/mallas/unidades-aprendizaje/${uaId}`)
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  if (loading) {
    return (
      <div className="text-center py-20" style={{ color: DIM_LT }}>
        <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
        Cargando...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm font-semibold transition-colors"
        style={{ color: NAVY }}
        onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.color = NAVY)}
      >
        <ChevronLeft size={16} /> Volver al módulo
      </button>

      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <span className="font-mono text-xs px-2 py-0.5 rounded inline-block mb-2" style={{ backgroundColor: '#ffffff10', color: GOLD }}>
          {uc?.codigo}
        </span>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '22px' }}>
          {uc?.nombre}
        </h1>
        <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '4px' }}>
          Editor avanzado: información, elementos de competencia, contenido mínimo y contenido analítico
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#7F1D1D20', color: '#FCA5A5' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ═══ INFORMACIÓN BÁSICA ═══ */}
      <Section title="Información básica">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Código *">
            <input type="text" value={formUC.codigo} onChange={(e) => setFormUC({ ...formUC, codigo: e.target.value })}
              disabled={!canWrite} className="input" style={inputStyle} />
          </Field>
          <div className="col-span-2">
            <Field label="Nombre *">
              <input type="text" value={formUC.nombre} onChange={(e) => setFormUC({ ...formUC, nombre: e.target.value })}
                disabled={!canWrite} className="input" style={inputStyle} />
            </Field>
          </div>
        </div>
        <Field label="Competencia general">
          <textarea value={formUC.competencia_general} onChange={(e) => setFormUC({ ...formUC, competencia_general: e.target.value })}
            disabled={!canWrite} rows={3} className="input resize-none" style={inputStyle} />
        </Field>
        <div className="grid grid-cols-4 gap-3">
          <Field label="Días"><input type="number" min="0" value={formUC.dias} onChange={(e) => setFormUC({ ...formUC, dias: e.target.value })} disabled={!canWrite} style={inputStyle} className="input" /></Field>
          <Field label="H. Teóricas"><input type="number" min="0" value={formUC.horas_teoricas} onChange={(e) => setFormUC({ ...formUC, horas_teoricas: e.target.value })} disabled={!canWrite} style={inputStyle} className="input" /></Field>
          <Field label="H. Prácticas"><input type="number" min="0" value={formUC.horas_practicas} onChange={(e) => setFormUC({ ...formUC, horas_practicas: e.target.value })} disabled={!canWrite} style={inputStyle} className="input" /></Field>
          <Field label="H. Totales"><input type="number" min="0" value={formUC.horas_totales} onChange={(e) => setFormUC({ ...formUC, horas_totales: e.target.value })} disabled={!canWrite} style={inputStyle} className="input" /></Field>
        </div>
        {canWrite && (
          <div className="flex justify-end">
            <button onClick={guardarUC} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: GOLD, color: NAVY }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar información básica
            </button>
          </div>
        )}
      </Section>

      {/* ═══ ELEMENTOS DE COMPETENCIA ═══ */}
      <Section title="Elementos de Competencia" subtitle={`${elementos.length} elementos`}>
        {elementos.length === 0 ? (
          <p style={{ color: DIM_LT, fontSize: '13px' }} className="text-center py-4">No hay elementos registrados.</p>
        ) : (
          <div className="space-y-2">
            {elementos.map(el => (
              <div key={el.id} className="rounded-lg p-3" style={{ backgroundColor: '#ffffff05', border: '1px solid rgba(212,175,55,0.1)' }}>
                {elementoEdit?.id === el.id ? (
                  <div className="space-y-2">
                    <input value={elementoEdit.titulo} onChange={(e) => setElementoEdit({ ...elementoEdit, titulo: e.target.value })}
                      placeholder="Título" style={inputStyle} className="input" />
                    <textarea value={elementoEdit.descripcion || ''} onChange={(e) => setElementoEdit({ ...elementoEdit, descripcion: e.target.value })}
                      placeholder="Descripción" rows={3} style={inputStyle} className="input resize-none" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setElementoEdit(null)} className="px-3 py-1.5 text-xs rounded" style={{ color: DIM_LT }}>Cancelar</button>
                      <button onClick={guardarElemento} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded" style={{ backgroundColor: GOLD, color: NAVY }}>
                        <Check size={12} /> Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: GOLD, color: NAVY }}>
                          {el.numero}
                        </span>
                        <h4 className="font-medium text-sm" style={{ color: TEXT_LT }}>{el.titulo}</h4>
                      </div>
                      {el.descripcion && <p style={{ color: DIM_LT, fontSize: '12px', marginLeft: '28px' }}>{el.descripcion}</p>}
                    </div>
                    {canWrite && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setElementoEdit({ id: el.id, titulo: el.titulo, descripcion: el.descripcion })}
                          className="p-1.5 rounded" style={{ color: DIM_LT }} title="Editar"><Edit size={13} /></button>
                        <button onClick={() => eliminarElemento(el.id)} className="p-1.5 rounded" style={{ color: DIM_LT }} title="Eliminar"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {canWrite && (
          <div className="rounded-lg p-3 mt-3" style={{ backgroundColor: '#ffffff03', border: '1px dashed rgba(212,175,55,0.25)' }}>
            <input value={nuevoElemento.titulo} onChange={(e) => setNuevoElemento({ ...nuevoElemento, titulo: e.target.value })}
              placeholder="Título del nuevo elemento" style={inputStyle} className="input mb-2" />
            <textarea value={nuevoElemento.descripcion} onChange={(e) => setNuevoElemento({ ...nuevoElemento, descripcion: e.target.value })}
              placeholder="Descripción" rows={2} style={inputStyle} className="input resize-none mb-2" />
            <button onClick={agregarElemento} disabled={!nuevoElemento.titulo.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded disabled:opacity-40"
              style={{ backgroundColor: GOLD, color: NAVY }}>
              <Plus size={12} /> Agregar elemento (N° {elementos.length + 1})
            </button>
          </div>
        )}
      </Section>

      {/* ═══ CONTENIDO MÍNIMO + ANALÍTICO ═══ */}
      <Section
        title="Contenido Mínimo y Contenido Analítico"
        subtitle={`${unidadesAp.length} unidades de aprendizaje`}
      >
        <p style={{ color: DIM_LT, fontSize: '12px', marginBottom: '12px' }}>
          Cada fila es una Unidad de Aprendizaje. La columna izquierda es el "Contenido Mínimo" y la derecha el "Contenido Analítico".
        </p>

        {unidadesAp.length === 0 ? (
          <p style={{ color: DIM_LT, fontSize: '13px' }} className="text-center py-4">No hay unidades de aprendizaje registradas.</p>
        ) : (
          <div className="overflow-hidden rounded-lg" style={{ border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="grid grid-cols-12 px-3 py-2 text-[10px] uppercase tracking-wider" style={{ backgroundColor: '#ffffff08', color: DIM_LT }}>
              <div className="col-span-1">N°</div>
              <div className="col-span-4">Contenido Mínimo</div>
              <div className="col-span-5">Contenido Analítico</div>
              <div className="col-span-1 text-center">Hrs</div>
              <div className="col-span-1 text-right">Acc.</div>
            </div>
            {unidadesAp.map(ua => (
              <div key={ua.id} className="grid grid-cols-12 px-3 py-3 items-start text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {uaEdit?.id === ua.id ? (
                  <>
                    <div className="col-span-1">
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: GOLD, color: NAVY }}>{ua.numero}</span>
                    </div>
                    <div className="col-span-4 pr-2">
                      <input value={uaEdit.titulo} onChange={(e) => setUaEdit({ ...uaEdit, titulo: e.target.value })} style={inputStyle} className="input" />
                    </div>
                    <div className="col-span-5 pr-2">
                      <textarea value={uaEdit.contenido_analitico || ''} onChange={(e) => setUaEdit({ ...uaEdit, contenido_analitico: e.target.value })}
                        rows={3} style={inputStyle} className="input resize-none" />
                    </div>
                    <div className="col-span-1 pr-2">
                      <input type="number" min="0" value={uaEdit.horas || 0} onChange={(e) => setUaEdit({ ...uaEdit, horas: e.target.value })} style={inputStyle} className="input" />
                    </div>
                    <div className="col-span-1 flex gap-1 justify-end">
                      <button onClick={() => setUaEdit(null)} className="p-1.5" style={{ color: DIM_LT }} title="Cancelar"><X size={13} /></button>
                      <button onClick={guardarUA} className="p-1.5 rounded" style={{ backgroundColor: GOLD, color: NAVY }} title="Guardar"><Check size={13} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-1">
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: GOLD, color: NAVY }}>{ua.numero}</span>
                    </div>
                    <div className="col-span-4 pr-2" style={{ color: TEXT_LT }}>{ua.titulo}</div>
                    <div className="col-span-5 pr-2" style={{ color: DIM_LT, fontSize: '12px' }}>{ua.contenido_analitico || '—'}</div>
                    <div className="col-span-1 text-center" style={{ color: DIM_LT }}>{ua.horas || 0}</div>
                    <div className="col-span-1 flex gap-1 justify-end">
                      {canWrite && (
                        <>
                          <button onClick={() => setUaEdit({ id: ua.id, titulo: ua.titulo, contenido_analitico: ua.contenido_analitico, horas: ua.horas })}
                            className="p-1.5" style={{ color: DIM_LT }} title="Editar"><Edit size={13} /></button>
                          <button onClick={() => eliminarUA(ua.id)} className="p-1.5" style={{ color: DIM_LT }} title="Eliminar"><Trash2 size={13} /></button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {canWrite && (
          <div className="rounded-lg p-3 mt-3 space-y-2" style={{ backgroundColor: '#ffffff03', border: '1px dashed rgba(212,175,55,0.25)' }}>
            <input value={nuevaUA.titulo} onChange={(e) => setNuevaUA({ ...nuevaUA, titulo: e.target.value })}
              placeholder="Contenido Mínimo" style={inputStyle} className="input" />
            <textarea value={nuevaUA.contenido_analitico} onChange={(e) => setNuevaUA({ ...nuevaUA, contenido_analitico: e.target.value })}
              placeholder="Contenido Analítico" rows={3} style={inputStyle} className="input resize-none" />
            <div className="flex items-center gap-2">
              <input type="number" min="0" value={nuevaUA.horas} onChange={(e) => setNuevaUA({ ...nuevaUA, horas: e.target.value })}
                placeholder="Horas" style={{ ...inputStyle, width: '100px' }} className="input" />
              <button onClick={agregarUA} disabled={!nuevaUA.titulo.trim()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded disabled:opacity-40"
                style={{ backgroundColor: GOLD, color: NAVY }}>
                <Plus size={12} /> Agregar U.A. N° {unidadesAp.length + 1}
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}

// ─── Helpers de UI ────────────────────────────────────────────────────

const inputStyle = {
  backgroundColor: '#ffffff0A',
  color: TEXT_LT,
  border: `1px solid ${GOLD}30`,
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
}

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-lg p-5 space-y-3" style={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.15)' }}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-base font-medium" style={{ color: GOLD }}>{title}</h2>
        {subtitle && <span className="text-xs" style={{ color: DIM_LT }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>{label}</label>
      {children}
    </div>
  )
}
