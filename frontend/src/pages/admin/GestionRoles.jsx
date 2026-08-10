import { useState, useEffect, useCallback } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import api from '../../services/api'
import {
  Plus, Edit, Trash2, X, Save, Loader2, Shield, Lock,
  AlertCircle, CheckCircle2,
} from 'lucide-react'

// El rol super_admin solo puede modificarlo otro super_admin. Para los demás
// (p. ej. un admin) aparece bloqueado, igual que en el backend.
const esRolProtegido = (rol) => rol?.nombre === 'super_admin'

const NAVY    = '#0A1628'
const GOLD    = '#C5A028'
const TEXT_LT = '#E2E8F0'
const DIM_LT  = '#94A3B8'

export default function GestionRoles() {
  const { isSuperAdmin, can } = usePermissions()

  // Solo se bloquea el rol super_admin cuando quien mira NO es super_admin.
  const rolBloqueado = (rol) => esRolProtegido(rol) && !isSuperAdmin

  const [roles, setRoles]         = useState([])
  const [permisos, setPermisos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(null)

  // CRUD modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({ nombre: '', descripcion: '' })

  // Permisos modal
  const [permModalOpen, setPermModalOpen] = useState(false)
  const [selectedRole, setSelectedRole]   = useState(null)
  const [savingPerms, setSavingPerms]     = useState(false)

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/roles')
      setRoles(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPermisos = useCallback(async () => {
    try {
      const { data } = await api.get('/roles/permisos')
      setPermisos(data || [])
    } catch (_) {}
  }, [])

  useEffect(() => { fetchRoles(); fetchPermisos() }, [fetchRoles, fetchPermisos])

  const flashSuccess = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 4000)
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ nombre: '', descripcion: '' })
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (rol) => {
    setEditItem(rol)
    setForm({
      nombre: rol.nombre || '',
      descripcion: rol.descripcion || '',
    })
    setError(null)
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      if (editItem) {
        await api.put(`/roles/${editItem.id}`, form)
      } else {
        await api.post('/roles', form)
      }

      setModalOpen(false)
      fetchRoles()
      flashSuccess(editItem ? 'Rol actualizado exitosamente.' : 'Rol creado exitosamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, rolNombre) => {
    if (!confirm(`¿Eliminar el rol "${rolNombre}" permanentemente? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/roles/${id}`)
      fetchRoles()
      flashSuccess(`Rol "${rolNombre}" eliminado exitosamente.`)
    } catch (err) {
      // El backend devuelve un mensaje detallado cuando el rol tiene usuarios asignados
      setError(err.message)
      // Hacer scroll a la cabecera para que el mensaje sea visible
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const openPermisosModal = (rol) => {
    setSelectedRole(rol)
    setError(null)
    setPermModalOpen(true)
  }

  const isPermisoAssigned = (permisoId) => {
    if (!selectedRole) return false
    return (selectedRole.permisos || []).some(p => p.id === permisoId)
  }

  const togglePermiso = async (permisoId) => {
    if (rolBloqueado(selectedRole)) return
    try {
      setError(null)
      if (isPermisoAssigned(permisoId)) {
        await api.delete(`/roles/${selectedRole.id}/permisos/${permisoId}`)
      } else {
        await api.post(`/roles/${selectedRole.id}/permisos`, { permiso_id: permisoId })
      }

      const { data } = await api.get('/roles')
      setRoles(data || [])
      const updated = (data || []).find(r => r.id === selectedRole.id)
      if (updated) setSelectedRole(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-BO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
  }

  if (!isSuperAdmin && !can('roles:admin')) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
          <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '28px' }}>
            Roles y Permisos
          </h1>
        </div>
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
          <Shield size={48} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
          <p style={{ color: TEXT_LT, fontSize: '16px' }}>Acceso restringido</p>
          <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '4px' }}>
            Solo super_admin tiene acceso a esta sección.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '28px' }}>
          Gestión de Roles
        </h1>
        <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
          Crear, editar roles y gestionar sus permisos
        </p>
      </div>

      {/* Mensajes */}
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

      {/* Botón crear */}
      <button
        onClick={openCreate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
        style={{ backgroundColor: GOLD, color: NAVY }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D4B84C'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <Plus size={16} /> Nuevo Rol
      </button>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-20" style={{ color: DIM_LT }}>
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
          Cargando roles...
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
          <Shield size={48} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
          <p style={{ color: TEXT_LT }}>No hay roles registrados.</p>
          <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '6px' }}>Crea el primer rol para empezar.</p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.15)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: `${NAVY}CC`, borderBottom: `1px solid ${GOLD}20` }}>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Nombre</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Descripción</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Permisos</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Creado</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => (
                <tr
                  key={rol.id}
                  className="transition-colors"
                  style={{ backgroundColor: NAVY, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2B4C7A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm" style={{ color: TEXT_LT }}>{rol.nombre}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: DIM_LT, fontSize: '13px' }} className="truncate max-w-xs">
                      {rol.descripcion || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: GOLD }}>
                      <Shield size={12} />
                      {(rol.permisos || []).length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: DIM_LT, fontSize: '13px' }}>{formatDate(rol.created_at)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openPermisosModal(rol)}
                        className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        style={{ color: GOLD, backgroundColor: `${GOLD}15` }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}30`)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}15`)}
                        title={rolBloqueado(rol) ? 'Ver permisos (rol protegido)' : 'Gestionar permisos'}
                      >
                        <Shield size={12} className="inline mr-1" />Permisos
                      </button>
                      {rolBloqueado(rol) ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium"
                          style={{ color: DIM_LT, backgroundColor: '#ffffff08' }}
                          title="El rol super_admin está protegido y no puede editarse ni eliminarse"
                        >
                          <Lock size={12} /> Protegido
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(rol)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: DIM_LT }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                            title="Editar rol"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(rol.id, rol.nombre)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: DIM_LT }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                            title="Eliminar rol"
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
      )}

      {/* ── Modal CRUD ───────────────────────────────────────────────────── */}
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
                  {editItem ? 'Editar Rol' : 'Nuevo Rol'}
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
                    placeholder="Ej: admin_lectura"
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm resize-none"
                    style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    placeholder="Descripción del rol..."
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                  />
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

      {/* ── Modal Gestión de Permisos ────────────────────────────────────── */}
      {permModalOpen && selectedRole && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setPermModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-lg rounded-xl overflow-hidden"
              style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}30` }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${GOLD}15` }}>
                <div>
                  <h2 className="font-heading text-lg font-medium" style={{ color: GOLD }}>
                    Permisos del Rol
                  </h2>
                  <p style={{ color: DIM_LT, fontSize: '12px', marginTop: '2px' }}>
                    Rol: {selectedRole.nombre}
                  </p>
                </div>
                <button
                  onClick={() => setPermModalOpen(false)}
                  className="p-1 rounded transition-colors"
                  style={{ color: DIM_LT }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_LT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-5">
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded text-xs mb-4" style={{ backgroundColor: '#7F1D1D20', color: '#FCA5A5' }}>
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                {rolBloqueado(selectedRole) && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded text-xs mb-4" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>
                    <Lock size={14} /> El rol super_admin está protegido. Solo un super administrador puede modificar sus permisos.
                  </div>
                )}

                {permisos.length === 0 ? (
                  <p className="text-center py-8" style={{ color: DIM_LT }}>No hay permisos disponibles.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {permisos.map((permiso) => {
                      const assigned = isPermisoAssigned(permiso.id)
                      const protegido = rolBloqueado(selectedRole)
                      return (
                        <label
                          key={permiso.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${protegido ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                          style={{
                            backgroundColor: assigned ? `${GOLD}15` : '#ffffff05',
                            border: `1px solid ${assigned ? GOLD + '40' : 'rgba(255,255,255,0.08)'}`,
                          }}
                          onMouseEnter={(e) => { if (!protegido) e.currentTarget.style.backgroundColor = assigned ? `${GOLD}25` : '#ffffff0A' }}
                          onMouseLeave={(e) => { if (!protegido) e.currentTarget.style.backgroundColor = assigned ? `${GOLD}15` : '#ffffff05' }}
                        >
                          <input
                            type="checkbox"
                            checked={assigned}
                            disabled={protegido}
                            onChange={() => togglePermiso(permiso.id)}
                            style={{ accentColor: GOLD }}
                            className="w-4 h-4 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm" style={{ color: assigned ? GOLD : TEXT_LT }}>
                              {permiso.nombre}
                            </p>
                            {permiso.descripcion && (
                              <p className="text-xs truncate" style={{ color: DIM_LT }}>{permiso.descripcion}</p>
                            )}
                          </div>
                          {assigned && <CheckCircle2 size={14} style={{ color: GOLD }} />}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: `1px solid ${GOLD}15` }}>
                <button
                  onClick={() => setPermModalOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ backgroundColor: GOLD, color: NAVY }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D4B84C' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = GOLD }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
