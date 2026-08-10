import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import api from '../../services/api'
import {
  Plus, Edit, Trash2, X, Save, Loader2, BookOpen,
  AlertCircle, Layers,
} from 'lucide-react'

const NAVY      = '#0A1628'
const GOLD      = '#C5A028'
const TEXT_LT   = '#E2E8F0'
const DIM_LT    = '#94A3B8'

// Genera años pares 2026..2050 para el selector
function generarAñosPares() {
  const lista = []
  for (let a = 2026; a <= 2050; a += 2) lista.push(a)
  return lista
}

export default function GestionMallas() {
  const { canWrite } = usePermissions()
  const navigate = useNavigate()
  const añosPares = useMemo(generarAñosPares, [])

  const [mallas, setMallas]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [saving, setSaving]       = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    year_start: añosPares[0],
    descripcion: '',
    estado: 'borrador',
  })

  const fetchMallas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/mallas')
      setMallas(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMallas() }, [fetchMallas])

  const openCreate = () => {
    setEditItem(null)
    setForm({ nombre: '', year_start: añosPares[0], descripcion: '', estado: 'borrador' })
    setModalOpen(true)
  }

  const openEdit = (malla) => {
    setEditItem(malla)
    setForm({
      nombre: malla.nombre || '',
      year_start: malla.year_start || añosPares[0],
      descripcion: malla.descripcion || '',
      estado: malla.estado || 'borrador',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      const payload = {
        nombre: form.nombre,
        year_start: parseInt(form.year_start, 10),
        descripcion: form.descripcion,
        estado: form.estado,
      }

      if (editItem) {
        await api.put(`/mallas/${editItem.id}`, payload)
      } else {
        await api.post('/mallas', payload)
      }

      setModalOpen(false)
      fetchMallas()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta malla permanentemente? Se eliminarán también todos sus semestres, ejes, módulos y unidades de competencia.')) return
    try {
      await api.delete(`/mallas/${id}`)
      fetchMallas()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'year_start') {
      setForm(prev => ({ ...prev, [name]: parseInt(value, 10) }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="space-y-6">

      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '28px' }}>
          Gestion de Mallas Curriculares
        </h1>
        <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
          {canWrite ? 'Crear, editar y gestionar mallas curriculares' : 'Vista de mallas curriculares'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#7F1D1D20', border: '1px solid #7F1D1D40', color: '#FCA5A5' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {canWrite && (
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: GOLD, color: NAVY }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D4B84C'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <Plus size={16} /> Nueva Malla Curricular
        </button>
      )}

      {loading ? (
        <div className="text-center py-20" style={{ color: DIM_LT }}>
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
          Cargando mallas...
        </div>
      ) : mallas.length === 0 ? (
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
          <BookOpen size={48} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
          <p style={{ color: TEXT_LT }}>No hay mallas curriculares registradas.</p>
          {canWrite && <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '6px' }}>Crea la primera malla para empezar.</p>}
        </div>
      ) : (
        <div className="grid gap-4">
          {mallas.map((malla) => (
            <div
              key={malla.id}
              className="rounded-lg overflow-hidden transition-all"
              style={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: malla.estado === 'activo' ? '#10B98120' : malla.estado === 'borrador' ? '#F59E0B20' : '#6B728020',
                        color: malla.estado === 'activo' ? '#6EE7B7' : malla.estado === 'borrador' ? '#FCD34D' : '#9CA3AF',
                      }}
                    >
                      {malla.estado}
                    </span>
                    <span style={{ color: DIM_LT, fontSize: '12px' }}>
                      Período: {malla.year_start} – {malla.year_end || (malla.year_start + 1)}
                    </span>
                    {malla.creada_en && (
                      <span style={{ color: DIM_LT, fontSize: '11px' }}>
                        Creada: {new Date(malla.creada_en).toLocaleDateString('es-BO')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-lg font-medium" style={{ color: TEXT_LT }}>{malla.nombre}</h3>
                  {malla.descripcion && (
                    <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '4px' }} className="truncate">{malla.descripcion}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => navigate(`/admin/mallas/${malla.id}`)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: DIM_LT }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                    title="Ver semestres"
                  >
                    <Layers size={16} />
                  </button>

                  {canWrite && (
                    <>
                      <button
                        onClick={() => openEdit(malla)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: DIM_LT }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                        title="Editar malla"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(malla.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: DIM_LT }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                        title="Eliminar malla"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
                  {editItem ? 'Editar Malla' : 'Nueva Malla Curricular'}
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
                  <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                    style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    placeholder="Ej: Plan de Estudios 2026"
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Año inicio *</label>
                    <select
                      name="year_start"
                      value={form.year_start}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    >
                      {añosPares.map(a => (
                        <option key={a} value={a} style={{ backgroundColor: NAVY }}>{a}</option>
                      ))}
                    </select>
                    <p className="text-[10px] mt-1" style={{ color: DIM_LT }}>Sólo años pares</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Año fin</label>
                    <input
                      type="text"
                      value={form.year_start + 1}
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg text-sm cursor-not-allowed"
                      style={{ backgroundColor: '#ffffff05', color: DIM_LT, border: `1px solid ${GOLD}15` }}
                    />
                    <p className="text-[10px] mt-1" style={{ color: DIM_LT }}>Calculado automáticamente</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Estado</label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                    style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                  >
                    <option value="borrador" style={{ backgroundColor: NAVY }}>Borrador</option>
                    <option value="activo" style={{ backgroundColor: NAVY }}>Activo</option>
                    <option value="inactivo" style={{ backgroundColor: NAVY }}>Inactivo</option>
                    <option value="archivado" style={{ backgroundColor: NAVY }}>Archivado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Descripcion</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm resize-none"
                    style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    placeholder="Descripcion opcional..."
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                  />
                </div>

                {!editItem && (
                  <div className="px-3 py-2 rounded text-xs" style={{ backgroundColor: '#1E40AF20', color: '#93C5FD', border: '1px solid #1E40AF40' }}>
                    Al crear la malla, el sistema generará automáticamente los 4 semestres, 8 ejes curriculares y los 12 módulos transversales fijos.
                  </div>
                )}

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
    </div>
  )
}
