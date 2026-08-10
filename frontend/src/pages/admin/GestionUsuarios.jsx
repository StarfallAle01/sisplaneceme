import { useState, useEffect, useCallback } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import api from '../../services/api'
import {
  Shield, UserCheck, UserX, AlertCircle, Loader2,
  CheckCircle2, XCircle, Plus, X, Edit, Trash2, Save, UserPlus,
} from 'lucide-react'

const NAVY      = '#0A1628'
const GOLD      = '#C5A028'
const TEXT_LT   = '#E2E8F0'
const DIM_LT    = '#94A3B8'

const ROLES_DISPONIBLES = [
  { id: 1, nombre: 'super_admin', color: '#F59E0B' },
  { id: 2, nombre: 'admin',       color: '#3B82F6' },
  { id: 3, nombre: 'profesor',    color: '#10B981' },
  { id: 4, nombre: 'lector',      color: '#6B7280' },
]

const EMPTY_FORM = {
  ci: '',
  email: '',
  nombre: '',
  apellidos: '',
  grado: '',
  password: '',
}

export default function GestionUsuarios() {
  const { isSuperAdmin, can } = usePermissions()

  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(null)
  const [rolModalOpen, setRolModalOpen] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRol, setSelectedRol]   = useState('')
  const [editMode, setEditMode]   = useState(false)
  const [form, setForm]           = useState({ ...EMPTY_FORM })
  const [saving, setSaving]       = useState(false)

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/usuarios')
      setUsuarios(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsuarios() }, [fetchUsuarios])

  const showSuccess = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 4000)
  }

  const openCreateUser = () => {
    setEditMode(false)
    setSelectedUser(null)
    setForm({ ...EMPTY_FORM })
    setUserModalOpen(true)
  }

  const openEditUser = (usuario) => {
    setEditMode(true)
    setSelectedUser(usuario)
    setForm({
      ci: usuario.ci || '',
      email: usuario.email || '',
      nombre: usuario.nombre || '',
      apellidos: usuario.apellidos || '',
      grado: usuario.grado || '',
      password: '',
    })
    setUserModalOpen(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      if (editMode && selectedUser) {
        await api.put(`/usuarios/${selectedUser.id}`, {
          ci: form.ci,
          email: form.email || undefined,
          nombre: form.nombre,
          apellidos: form.apellidos,
          grado: form.grado || undefined,
        })
        showSuccess('Usuario actualizado exitosamente.')
      } else {
        await api.post('/usuarios', {
          ci: form.ci,
          email: form.email || undefined,
          nombre: form.nombre,
          apellidos: form.apellidos,
          grado: form.grado || undefined,
          password: form.password,
        })
        showSuccess('Usuario creado exitosamente.')
      }

      setUserModalOpen(false)
      fetchUsuarios()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (usuario) => {
    if (!confirm(`Eliminar permanentemente a ${usuario.nombre} ${usuario.apellidos}?`)) return
    try {
      await api.delete(`/usuarios/${usuario.id}`)
      showSuccess('Usuario eliminado exitosamente.')
      fetchUsuarios()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleEstado = async (usuario) => {
    const nuevoEstado = !usuario.activo
    const accion = nuevoEstado ? 'activar' : 'desactivar'
    if (!confirm(`${accion} a ${usuario.nombre} ${usuario.apellidos}?`)) return
    try {
      await api.patch(`/usuarios/${usuario.id}/estado`, { activo: nuevoEstado })
      showSuccess(`Usuario ${accion}do exitosamente.`)
      fetchUsuarios()
    } catch (err) {
      setError(err.message)
    }
  }

  const openAsignarRol = (usuario) => {
    setSelectedUser(usuario)
    setSelectedRol('')
    setError(null)
    setRolModalOpen(true)
  }

  const handleAsignarRol = async () => {
    if (!selectedRol) return
    try {
      setError(null)
      await api.post(`/usuarios/${selectedUser.id}/roles`, { rol_id: parseInt(selectedRol) })
      showSuccess(`Rol asignado a ${selectedUser.nombre} exitosamente.`)
      setRolModalOpen(false)
      fetchUsuarios()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleQuitarRol = async (usuarioId, rolId) => {
    if (!confirm('Quitar este rol al usuario?')) return
    try {
      await api.delete(`/usuarios/${usuarioId}/roles/${rolId}`)
      showSuccess('Rol removido exitosamente.')
      fetchUsuarios()
    } catch (err) {
      setError(err.message)
    }
  }

  const getUsuarioRolIds = (u) => (u.roles || []).map(r => r.id)

  // Un usuario con rol super_admin solo puede ser gestionado por otro super_admin.
  const esSuperAdminUser = (u) => (u.roles || []).some(r => r.nombre === 'super_admin')
  const puedeGestionar = (u) => isSuperAdmin || !esSuperAdminUser(u)

  const handleUserFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">

      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '28px' }}>
          Administración de Usuarios
        </h1>
        <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
          {isSuperAdmin ? 'Administración completa de usuarios y roles' : 'Vista de usuarios del sistema'}
        </p>
      </div>

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

      {isSuperAdmin && (
        <button
          onClick={openCreateUser}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: GOLD, color: NAVY }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D4B84C'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <UserPlus size={16} /> Nuevo Usuario
        </button>
      )}

      {loading ? (
        <div className="text-center py-20" style={{ color: DIM_LT }}>
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" /> Cargando usuarios...
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
          <p style={{ color: TEXT_LT }}>No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.15)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: `${NAVY}CC`, borderBottom: `1px solid ${GOLD}20` }}>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Usuario</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>CI</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Email</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Roles</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Estado</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors"
                  style={{ backgroundColor: NAVY, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2B4C7A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm" style={{ color: TEXT_LT }}>{u.nombre} {u.apellidos}</p>
                    <p style={{ color: DIM_LT, fontSize: '10px' }} className="mt-0.5">{u.grado || 'Sin grado'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: GOLD, fontSize: '13px', fontWeight: 500 }}>{u.ci || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: DIM_LT, fontSize: '12px' }}>{u.email || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.roles || []).map((rol) => (
                        <span
                          key={rol.id}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: `${ROLES_DISPONIBLES.find(r => r.id === rol.id)?.color || GOLD}20`,
                            color: ROLES_DISPONIBLES.find(r => r.id === rol.id)?.color || GOLD,
                          }}
                        >
                          {rol.nombre}
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleQuitarRol(u.id, rol.id)}
                              className="hover:opacity-70"
                              title="Quitar rol"
                            >
                              x
                            </button>
                          )}
                        </span>
                      ))}
                      {(u.roles || []).length === 0 && (
                        <span style={{ color: DIM_LT, fontSize: '11px' }}>Sin rol</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer"
                      style={{
                        backgroundColor: u.activo ? '#05966920' : '#7F1D1D20',
                        color: u.activo ? '#6EE7B7' : '#FCA5A5',
                      }}
                      onClick={() => can('usuarios:editar') && puedeGestionar(u) && handleToggleEstado(u)}
                      title={!puedeGestionar(u) ? 'Solo un super_admin puede gestionar a un super administrador' : can('usuarios:editar') ? 'Clic para cambiar estado' : ''}
                    >
                      {u.activo ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => openAsignarRol(u)}
                            className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                            style={{ color: GOLD, backgroundColor: `${GOLD}15` }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}30`)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}15`)}
                          >
                            <Shield size={12} className="inline mr-0.5" />Rol
                          </button>
                          <button
                            onClick={() => openEditUser(u)}
                            className="px-2 py-1 rounded text-xs font-medium transition-colors"
                            style={{ color: DIM_LT }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                            title="Editar usuario"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="px-2 py-1 rounded text-xs font-medium transition-colors"
                            style={{ color: DIM_LT }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                            title="Eliminar usuario"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      {!isSuperAdmin && can('usuarios:editar') && puedeGestionar(u) && (
                        <button
                          onClick={() => handleToggleEstado(u)}
                          className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                          style={{
                            color: u.activo ? '#FCA5A5' : '#6EE7B7',
                            backgroundColor: u.activo ? '#7F1D1D15' : '#05966915',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = u.activo ? '#7F1D1D25' : '#05966925')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = u.activo ? '#7F1D1D15' : '#05966915')}
                        >
                          {u.activo ? <UserX size={12} className="inline mr-1" /> : <UserCheck size={12} className="inline mr-1" />}
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rolModalOpen && selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setRolModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-xl overflow-hidden"
              style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}30` }}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${GOLD}15` }}>
                <div>
                  <h2 className="font-heading text-lg font-medium" style={{ color: GOLD }}>Asignar Rol</h2>
                  <p style={{ color: DIM_LT, fontSize: '12px', marginTop: '2px' }}>
                    Usuario: {selectedUser.nombre} {selectedUser.apellidos}
                  </p>
                </div>
                <button onClick={() => setRolModalOpen(false)} className="p-1 rounded transition-colors" style={{ color: DIM_LT }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_LT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT_LT }}>Seleccionar Rol</label>
                  <div className="space-y-2">
                    {ROLES_DISPONIBLES.filter(r => !getUsuarioRolIds(selectedUser).includes(r.id)).map((rol) => (
                      <label
                        key={rol.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors border border-white/8"
                        style={{ backgroundColor: selectedRol === String(rol.id) ? `${rol.color}20` : '#ffffff05' }}
                        onMouseEnter={(e) => { if (selectedRol !== String(rol.id)) e.currentTarget.style.backgroundColor = '#ffffff0A' }}
                        onMouseLeave={(e) => { if (selectedRol !== String(rol.id)) e.currentTarget.style.backgroundColor = '#ffffff05' }}
                      >
                        <input
                          type="radio"
                          name="rol"
                          value={String(rol.id)}
                          checked={selectedRol === String(rol.id)}
                          onChange={(e) => setSelectedRol(e.target.value)}
                          style={{ accentColor: rol.color }}
                        />
                        <div>
                          <p className="font-medium text-sm" style={{ color: rol.color }}>{rol.nombre}</p>
                        </div>
                      </label>
                    ))}
                    {ROLES_DISPONIBLES.every(r => getUsuarioRolIds(selectedUser).includes(r.id)) && (
                      <p style={{ color: DIM_LT, fontSize: '13px' }} className="text-center py-4">
                        El usuario ya tiene todos los roles disponibles.
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded text-xs" style={{ backgroundColor: '#7F1D1D20', color: '#FCA5A5' }}>
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setRolModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: DIM_LT }}>Cancelar</button>
                  <button
                    onClick={handleAsignarRol}
                    disabled={!selectedRol}
                    className="px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    <Shield size={14} className="inline mr-1.5" /> Asignar Rol
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {userModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setUserModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-lg rounded-xl overflow-hidden"
              style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}30` }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${GOLD}15` }}>
                <h2 className="font-heading text-lg font-medium" style={{ color: GOLD }}>
                  {editMode ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="p-1 rounded transition-colors"
                  style={{ color: DIM_LT }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_LT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>CI *</label>
                    <input
                      type="text"
                      name="ci"
                      value={form.ci}
                      onChange={handleUserFormChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                      placeholder="Ej: 1234567"
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Grado</label>
                    <input
                      type="text"
                      name="grado"
                      value={form.grado}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                      placeholder="Ej: Cnl."
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleUserFormChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                    style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    placeholder="Nombre"
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleUserFormChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                    style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    placeholder="Apellidos"
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleUserFormChange}
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                    style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                    placeholder="correo@ejemplo.com"
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                  />
                </div>

                {!editMode && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>Contrasena *</label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleUserFormChange}
                      required={!editMode}
                      className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                      style={{ backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }}
                      placeholder="Minimo 6 caracteres"
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                    />
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
                    onClick={() => setUserModalOpen(false)}
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
                    {saving ? 'Guardando...' : editMode ? 'Actualizar' : 'Crear'}
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
