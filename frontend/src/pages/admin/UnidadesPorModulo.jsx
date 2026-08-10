import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import api from '../../services/api'
import { ChevronLeft, Loader2, AlertCircle, Plus, Edit, Trash2, X, Save, Settings2 } from 'lucide-react'

const NAVY    = '#0A1628'
const GOLD    = '#C5A028'
const TEXT_LT = '#E2E8F0'
const DIM_LT  = '#94A3B8'

const formVacio = {
  codigo: '',
  nombre: '',
  competencia_general: '',
  dias: 0,
  horas_teoricas: 0,
  horas_practicas: 0,
  horas_totales: 0,
  orden: 1,
}

export default function UnidadesPorModulo() {
  const { moduloId } = useParams()
  const navigate = useNavigate()
  const { canWrite } = usePermissions()

  const [modulo, setModulo]   = useState(null)
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(formVacio)
  const [saving, setSaving]       = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [{ data: ucs }] = await Promise.all([
        api.get(`/mallas/modulos/${moduloId}/unidades-competencia`),
      ])
      setUnidades(Array.isArray(ucs) ? ucs : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [moduloId])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditItem(null)
    setForm({ ...formVacio, orden: unidades.length + 1 })
    setModalOpen(true)
  }

  const openEdit = (uc) => {
    setEditItem(uc)
    setForm({
      codigo: uc.codigo || '',
      nombre: uc.nombre || '',
      competencia_general: uc.competencia_general || '',
      dias: uc.dias ?? 0,
      horas_teoricas: uc.horas_teoricas ?? 0,
      horas_practicas: uc.horas_practicas ?? 0,
      horas_totales: uc.horas_totales ?? 0,
      orden: uc.orden ?? 1,
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      const payload = {
        modulo_id: parseInt(moduloId, 10),
        codigo: form.codigo,
        nombre: form.nombre,
        competencia_general: form.competencia_general || null,
        dias: parseInt(form.dias, 10) || 0,
        horas_teoricas: parseInt(form.horas_teoricas, 10) || 0,
        horas_practicas: parseInt(form.horas_practicas, 10) || 0,
        horas_totales: parseInt(form.horas_totales, 10) || 0,
        orden: parseInt(form.orden, 10) || 1,
      }

      if (editItem) {
        await api.put(`/mallas/unidades-competencia/${editItem.id}`, payload)
      } else {
        await api.post(`/mallas/unidades-competencia`, payload)
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta Unidad de Competencia? Se eliminarán también sus elementos, unidades de aprendizaje y bibliografía.')) return
    try {
      await api.delete(`/mallas/unidades-competencia/${id}`)
      fetchData()
    } catch (err) {
      setError(err.message)
    }
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
        <ChevronLeft size={16} /> Volver
      </button>

      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: DIM_LT }}>
          Módulo
        </span>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '22px' }}>
          Unidades de Competencia
        </h1>
        <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '4px' }}>
          Materias/asignaturas pertenecientes al módulo
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#7F1D1D20', color: '#FCA5A5' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {canWrite && (
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
          style={{ backgroundColor: GOLD, color: NAVY }}
        >
          <Plus size={16} /> Nueva Unidad de Competencia
        </button>
      )}

      <div className="grid gap-3">
        {unidades.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: NAVY }}>
            <p style={{ color: DIM_LT }}>No hay unidades de competencia registradas en este módulo.</p>
          </div>
        ) : unidades.map(uc => (
          <div
            key={uc.id}
            className="rounded-lg px-5 py-4"
            style={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.15)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#ffffff10', color: GOLD }}>
                    {uc.codigo}
                  </span>
                  <span style={{ color: DIM_LT, fontSize: '11px' }}>
                    {uc.dias || 0} días · {uc.horas_totales || 0}h
                  </span>
                </div>
                <h3 className="font-heading text-base font-medium" style={{ color: TEXT_LT }}>{uc.nombre}</h3>
                {uc.competencia_general && (
                  <p style={{ color: DIM_LT, fontSize: '12px', marginTop: '4px' }} className="line-clamp-2">
                    {uc.competencia_general}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/unidades/${uc.id}/editar`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                  style={{ backgroundColor: '#C5A02815', color: GOLD }}
                  title="Edición avanzada"
                >
                  <Settings2 size={12} /> Editar contenidos
                </Link>

                {canWrite && (
                  <>
                    <button onClick={() => openEdit(uc)} className="p-2 rounded" style={{ color: DIM_LT }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                      title="Editar info básica"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(uc.id)} className="p-2 rounded" style={{ color: DIM_LT }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                      title="Eliminar"><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}30` }}>
              <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${GOLD}15` }}>
                <h2 className="font-heading text-lg font-medium" style={{ color: GOLD }}>
                  {editItem ? 'Editar UC' : 'Nueva Unidad de Competencia'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-1" style={{ color: DIM_LT }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSave} className="px-6 py-5 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>Código *</label>
                    <input type="text" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }} placeholder="TI-PC-CE-01" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>Nombre *</label>
                    <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }} placeholder="EL COMANDANTE Y SU ESTADO MAYOR" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>Competencia general</label>
                  <textarea value={form.competencia_general} onChange={(e) => setForm({ ...form, competencia_general: e.target.value })}
                    rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }} placeholder="Descripción de la competencia..." />
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>Días</label>
                    <input type="number" min="0" value={form.dias} onChange={(e) => setForm({ ...form, dias: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>H. Teó.</label>
                    <input type="number" min="0" value={form.horas_teoricas} onChange={(e) => setForm({ ...form, horas_teoricas: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>H. Práct.</label>
                    <input type="number" min="0" value={form.horas_practicas} onChange={(e) => setForm({ ...form, horas_practicas: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>H. Tot.</label>
                    <input type="number" min="0" value={form.horas_totales} onChange={(e) => setForm({ ...form, horas_totales: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_LT }}>Orden</label>
                    <input type="number" min="1" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: DIM_LT }}>Cancelar</button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ backgroundColor: GOLD, color: NAVY }}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
