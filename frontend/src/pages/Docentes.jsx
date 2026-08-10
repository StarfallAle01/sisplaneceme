import { useState, useEffect, useCallback, useRef } from "react"
import { Users, Search, Award, Loader2, AlertCircle, X, IdCard, ShieldCheck, Save, Upload, FileText, Trash2, Briefcase, BookOpen, User, Eye } from "lucide-react"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const NAVY     = "#0A1628"
const NAVY_LT  = "#112240"
const GOLD     = "#C5A028"
const TEXT_LT  = "#E2E8F0"
const DIM_LT   = "#94A3B8"

const GRADO_ORDEN = ["CNL.", "TCNL.", "MAYOR", "CAP.", "TTE."]

function ordenarPorGrado(a, b) {
  const ga = GRADO_ORDEN.findIndex(g => (a.grado || "").toUpperCase().startsWith(g))
  const gb = GRADO_ORDEN.findIndex(g => (b.grado || "").toUpperCase().startsWith(g))
  if (ga !== gb) {
    if (ga === -1) return 1
    if (gb === -1) return -1
    return ga - gb
  }
  return (a.apellidos || "").localeCompare(b.apellidos || "")
}

export default function Docentes() {
  const { user } = useAuth()
  const [docentes, setDocentes] = useState([])
  const [docentesFiltrados, setDocentesFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDocente, setSelectedDocente] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [perfilLoading, setPerfilLoading] = useState(false)
  const [perfilError, setPerfilError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const esPropio = user && selectedDocente && user.id === selectedDocente.id

  const fetchDocentes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get("/docentes")
      const lista = Array.isArray(data) ? data : []
      const ordenados = lista.sort(ordenarPorGrado)
      setDocentes(ordenados)
      setDocentesFiltrados(ordenados)
    } catch (err) {
      setError(err.message || "Error al cargar la lista de docentes")
      setDocentes([])
      setDocentesFiltrados([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocentes() }, [fetchDocentes])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setDocentesFiltrados(docentes)
      return
    }
    const term = searchTerm.toLowerCase()
    setDocentesFiltrados(
      docentes.filter(d =>
        (d.nombre || "").toLowerCase().includes(term) ||
        (d.apellidos || "").toLowerCase().includes(term) ||
        (d.grado || "").toLowerCase().includes(term) ||
        (d.ci || "").includes(term) ||
        (d.email || "").toLowerCase().includes(term)
      )
    )
  }, [searchTerm, docentes])

  const abrirDrawer = async (doc) => {
    setSelectedDocente(doc)
    setSaveMsg(null)
    setPerfilError(null)
    setPerfilLoading(true)

    if (doc.perfil) {
      setPerfil(doc.perfil)
      setPerfilLoading(false)
    } else {
      try {
        const { data } = await api.get(`/docentes/${doc.id}/perfil`)
        setPerfil(data)
      } catch (err) {
        setPerfilError("No se pudo cargar el perfil.")
        setPerfil(null)
      } finally {
        setPerfilLoading(false)
      }
    }
  }

  const cerrarDrawer = () => {
    setSelectedDocente(null)
    setPerfil(null)
    setPerfilError(null)
    setSaveMsg(null)
  }

  const handlePerfilChange = (field, value) => {
    setPerfil(prev => prev ? { ...prev, [field]: value } : { [field]: value })
  }

  const handleSavePerfil = async () => {
    if (!selectedDocente || !esPropio) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const { data } = await api.put(`/docentes/${selectedDocente.id}/perfil`, {
        especialidad: perfil?.especialidad || '',
        area: perfil?.area || '',
        descripcion: perfil?.descripcion || '',
        experiencia_laboral: perfil?.experiencia_laboral || '',
        cursos_realizados: perfil?.cursos_realizados || '',
      })
      setPerfil(data)
      setSaveMsg({ tipo: 'success', texto: 'Perfil guardado correctamente.' })
      fetchDocentes()
    } catch (err) {
      setSaveMsg({ tipo: 'error', texto: err.message || 'Error al guardar.' })
    } finally {
      setSaving(false)
    }
  }

  const handleSubirJustificante = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedDocente) return

    if (file.type !== 'application/pdf') {
      setSaveMsg({ tipo: 'error', texto: 'Solo se permiten archivos PDF.' })
      return
    }

    setUploading(true)
    setSaveMsg(null)
    try {
      const formData = new FormData()
      formData.append('archivo', file)
      const { data } = await api.post(`/docentes/${selectedDocente.id}/justificantes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPerfil(prev => ({
        ...prev,
        justificantes: [...(prev?.justificantes || []), data],
      }))
      setSaveMsg({ tipo: 'success', texto: 'Justificante subido correctamente.' })
      fetchDocentes()
    } catch (err) {
      setSaveMsg({ tipo: 'error', texto: err.message || 'Error al subir archivo.' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleEliminarJustificante = async (justificanteId) => {
    if (!selectedDocente) return
    try {
      await api.delete(`/docentes/${selectedDocente.id}/justificantes/${justificanteId}`)
      setPerfil(prev => ({
        ...prev,
        justificantes: (prev?.justificantes || []).filter(j => j.id !== justificanteId),
      }))
      fetchDocentes()
    } catch (err) {
      setSaveMsg({ tipo: 'error', texto: 'Error al eliminar justificante.' })
    }
  }

  const limpiarBusqueda = () => setSearchTerm("")

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 size={44} className="mx-auto mb-4 animate-spin" style={{ color: GOLD }} />
          <p style={{ color: DIM_LT, fontSize: "15px" }}>Cargando plantel docente...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl px-7 py-6" style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, " + NAVY_LT + " 100%)", border: "1px solid " + GOLD + "18" }}>
          <h1 className="font-heading font-bold tracking-tight" style={{ color: GOLD, fontSize: "26px" }}>Plantel Docente</h1>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#7F1D1D12", border: "1px solid #7F1D1D2A", color: "#FCA5A5" }}>
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button onClick={fetchDocentes} className="text-xs font-medium px-3 py-1 rounded" style={{ color: "#FCA5A5" }}>Reintentar</button>
        </div>
      </div>
    )
  }

  if (docentes.length === 0) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl px-7 py-6" style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, " + NAVY_LT + " 100%)", border: "1px solid " + GOLD + "18" }}>
          <h1 className="font-heading font-bold tracking-tight" style={{ color: GOLD, fontSize: "26px" }}>Plantel Docente</h1>
        </div>
        <div className="rounded-xl p-16 text-center" style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "0E" }}>
          <Users size={48} className="mx-auto mb-4" style={{ color: GOLD, opacity: 0.25 }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: TEXT_LT }}>No hay docentes registrados</h2>
          <p style={{ color: DIM_LT, fontSize: "14px" }}>Contacte al administrador del sistema para registrar docentes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl px-7 py-6"
        style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, " + NAVY_LT + " 100%)", border: "1px solid " + GOLD + "18" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading font-bold tracking-tight" style={{ color: GOLD, fontSize: "26px", lineHeight: "1.2" }}>
              Plantel Docente
            </h1>
            <p style={{ color: DIM_LT, fontSize: "14px", marginTop: "4px" }}>
              {docentes.length} docente{docentes.length !== 1 ? "s" : ""} registrado{docentes.length !== 1 ? "s" : ""} en el sistema
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl px-5 py-3" style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "12" }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#64748B" }} />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, grado, CI o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: NAVY_LT, color: TEXT_LT, border: "1px solid " + GOLD + "12" }}
          />
        </div>
        {searchTerm && (
          <button onClick={limpiarBusqueda} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: "transparent", color: DIM_LT, border: "1px solid " + GOLD + "18" }}>
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      {docentesFiltrados.length === 0 && searchTerm && (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "0E" }}>
          <Search size={36} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
          <p style={{ color: DIM_LT, fontSize: "14px" }}>No se encontraron docentes que coincidan con &quot;{searchTerm}&quot;</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docentesFiltrados.map((doc) => {
          const tienePerfil = doc.perfil && (doc.perfil.especialidad || doc.perfil.experiencia_laboral || doc.perfil.cursos_realizados)
          return (
            <div
              key={doc.id}
              onClick={() => abrirDrawer(doc)}
              className="rounded-xl p-5 transition-all cursor-pointer relative"
              style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "10" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = GOLD + "40"; e.currentTarget.style.transform = "translateY(-2px)" }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = GOLD + "10"; e.currentTarget.style.transform = "none" }}
            >
              {user && doc.id === user.id && (
                <span className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: GOLD + "20", color: GOLD }}>
                  Tu perfil
                </span>
              )}
              <h3 className="font-heading font-bold leading-snug" style={{ color: TEXT_LT, fontSize: "15px" }}>
                {doc.nombre} {doc.apellidos}
              </h3>

              {doc.grado ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <Award size={12} style={{ color: GOLD, opacity: 0.7 }} />
                  <span className="text-xs font-medium" style={{ color: GOLD }}>{doc.grado}</span>
                </div>
              ) : (
                <span className="text-xs mt-1 block" style={{ color: DIM_LT }}>Sin grado</span>
              )}

              {doc.perfil?.justificantes?.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <FileText size={11} style={{ color: DIM_LT }} />
                  <span className="text-[10px]" style={{ color: DIM_LT }}>{doc.perfil.justificantes.length} justificante{doc.perfil.justificantes.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              {tienePerfil && (
                <div className="flex items-center gap-1 mt-2">
                  <Eye size={11} style={{ color: GOLD, opacity: 0.6 }} />
                  <span className="text-[10px]" style={{ color: GOLD, opacity: 0.6 }}>Perfil completado</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-300"
        style={{ backgroundColor: selectedDocente ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)", opacity: selectedDocente ? 1 : 0 }}
        onClick={cerrarDrawer}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 w-full max-w-lg flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          backgroundColor: NAVY,
          borderLeft: `1px solid ${GOLD}30`,
          transform: selectedDocente ? "translateX(0)" : "translateX(100%)",
          boxShadow: selectedDocente ? "-8px 0 30px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {selectedDocente && (
          <>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${GOLD}15` }}>
              <div>
                <h2 className="font-heading text-lg font-bold" style={{ color: TEXT_LT }}>
                  {selectedDocente.nombre} {selectedDocente.apellidos}
                </h2>
                {selectedDocente.grado && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Award size={13} style={{ color: GOLD }} />
                    <span className="text-sm font-medium" style={{ color: GOLD }}>{selectedDocente.grado}</span>
                    {esPropio && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: GOLD + "20", color: GOLD }}>Tu perfil</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={cerrarDrawer}
                className="p-2 rounded-lg transition-colors"
                style={{ color: DIM_LT }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = GOLD + "15"; e.currentTarget.style.color = GOLD }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = DIM_LT }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Info Personal */}
              <div className="rounded-lg p-4" style={{ backgroundColor: NAVY_LT, border: `1px solid ${GOLD}10` }}>
                <div className="flex items-center gap-2 mb-3">
                  <IdCard size={16} style={{ color: GOLD }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>Información Personal</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>Cédula de Identidad</p>
                    <p className="text-sm font-mono" style={{ color: TEXT_LT }}>{selectedDocente.ci || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>Nombre Completo</p>
                    <p className="text-sm" style={{ color: TEXT_LT }}>{selectedDocente.nombre} {selectedDocente.apellidos}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>Grado Militar</p>
                    <p className="text-sm" style={{ color: TEXT_LT }}>{selectedDocente.grado || 'No asignado'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>Correo</p>
                    <p className="text-sm" style={{ color: TEXT_LT }}>{selectedDocente.email || 'No registrado'}</p>
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div className="rounded-lg p-4" style={{ backgroundColor: NAVY_LT, border: `1px solid ${GOLD}10` }}>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} style={{ color: GOLD }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>Estado</span>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded font-medium"
                  style={{
                    backgroundColor: selectedDocente.activo ? '#05966920' : '#7F1D1D20',
                    color: selectedDocente.activo ? '#6EE7B7' : '#FCA5A5',
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedDocente.activo ? '#6EE7B7' : '#FCA5A5' }} />
                  {selectedDocente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Perfil Profesional - siempre visible, solo editable si es propio */}
              {perfilLoading ? (
                <div className="rounded-lg p-6 text-center" style={{ backgroundColor: NAVY_LT }}>
                  <Loader2 size={20} className="mx-auto mb-2 animate-spin" style={{ color: GOLD }} />
                  <p className="text-xs" style={{ color: DIM_LT }}>Cargando perfil...</p>
                </div>
              ) : perfilError ? (
                <div className="rounded-lg p-4" style={{ backgroundColor: NAVY_LT, border: `1px solid ${GOLD}10` }}>
                  <p className="text-xs" style={{ color: "#FCA5A5" }}>{perfilError}</p>
                </div>
              ) : (
                <>
                  {/* Sección editable: Perfil Profesional */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: NAVY_LT, border: `1px solid ${GOLD}10` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <User size={16} style={{ color: GOLD }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
                        Perfil Profesional {esPropio && <span className="text-[10px] ml-1" style={{ color: DIM_LT }}>(editable)</span>}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <CampoPerfil label="Especialidad" field="especialidad" value={perfil} onChange={handlePerfilChange} editable={esPropio} />
                      <CampoPerfil label="Área" field="area" value={perfil} onChange={handlePerfilChange} editable={esPropio} />
                      <CampoPerfil label="Descripción" field="descripcion" value={perfil} onChange={handlePerfilChange} editable={esPropio} multiline />
                    </div>
                  </div>

                  {/* Experiencia Laboral */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: NAVY_LT, border: `1px solid ${GOLD}10` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase size={16} style={{ color: GOLD }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
                        Experiencia Laboral {esPropio && <span className="text-[10px] ml-1" style={{ color: DIM_LT }}>(editable)</span>}
                      </span>
                    </div>
                    <CampoPerfil label="Experiencia" field="experiencia_laboral" value={perfil} onChange={handlePerfilChange} editable={esPropio} multiline rows={4} placeholder="Describa su experiencia laboral relevante..." />
                  </div>

                  {/* Cursos Realizados */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: NAVY_LT, border: `1px solid ${GOLD}10` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={16} style={{ color: GOLD }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
                        Cursos Realizados {esPropio && <span className="text-[10px] ml-1" style={{ color: DIM_LT }}>(editable)</span>}
                      </span>
                    </div>
                    <CampoPerfil label="Cursos" field="cursos_realizados" value={perfil} onChange={handlePerfilChange} editable={esPropio} multiline rows={4} placeholder="Liste los cursos, diplomados y certificaciones realizadas..." />
                  </div>

                  {/* Justificantes (PDFs) */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: NAVY_LT, border: `1px solid ${GOLD}10` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={16} style={{ color: GOLD }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>Justificantes</span>
                    </div>

                    {(perfil?.justificantes || []).length === 0 && (
                      <p className="text-xs mb-3" style={{ color: DIM_LT }}>
                        {esPropio ? 'No has subido justificantes aún.' : 'No hay justificantes registrados.'}
                      </p>
                    )}

                    <div className="space-y-2 mb-3">
                      {(perfil?.justificantes || []).map((j) => (
                        <div key={j.id} className="flex items-center justify-between gap-2 p-2 rounded" style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}10` }}>
                          <a
                            href={`${API_URL}${j.ruta}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 flex-1 min-w-0 text-xs"
                            style={{ color: TEXT_LT }}
                          >
                            <FileText size={14} style={{ color: GOLD, opacity: 0.7 }} />
                            <span className="truncate">{j.nombre_original}</span>
                          </a>
                          {esPropio && (
                            <button
                              onClick={() => handleEliminarJustificante(j.id)}
                              className="p-1 rounded hover:opacity-80 shrink-0"
                              style={{ color: "#FCA5A5" }}
                              title="Eliminar justificante"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {esPropio && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleSubirJustificante}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                          style={{ backgroundColor: GOLD + "15", color: GOLD, border: `1px solid ${GOLD}30` }}
                          onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.backgroundColor = GOLD + "25" }}
                          onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.backgroundColor = GOLD + "15" }}
                        >
                          <Upload size={14} />
                          {uploading ? 'Subiendo...' : 'Agregar Justificante'}
                        </button>
                        <p className="text-[10px] mt-1.5" style={{ color: DIM_LT }}>Solo archivos PDF (máx. 10 MB)</p>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Mensajes de estado */}
              {saveMsg && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    backgroundColor: saveMsg.tipo === 'success' ? '#05966915' : '#7F1D1D15',
                    border: `1px solid ${saveMsg.tipo === 'success' ? '#05966930' : '#7F1D1D30'}`,
                    color: saveMsg.tipo === 'success' ? '#6EE7B7' : '#FCA5A5',
                  }}
                >
                  {saveMsg.texto}
                </div>
              )}
            </div>

            {/* Botón Guardar */}
            {esPropio && (
              <div className="px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${GOLD}15` }}>
                <button
                  onClick={handleSavePerfil}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-all disabled:opacity-60"
                  style={{ backgroundColor: GOLD, color: NAVY }}
                  onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.backgroundColor = '#D4B84C'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = 'none' } }}
                >
                  <Save size={16} />
                  {saving ? 'Guardando...' : 'Guardar Perfil'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CampoPerfil({ label, field, value, onChange, editable, multiline, rows = 3, placeholder }) {
  const val = value?.[field] || ''

  if (!editable) {
    if (!val) {
      return (
        <div>
          <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>{label}</p>
          <p className="text-sm italic" style={{ color: "#475569" }}>Sin información</p>
        </div>
      )
    }
    return (
      <div>
        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>{label}</p>
        <p className="text-sm whitespace-pre-wrap" style={{ color: TEXT_LT }}>{val}</p>
      </div>
    )
  }

  if (multiline) {
    return (
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>{label}</p>
        <textarea
          value={val}
          onChange={(e) => onChange(field, e.target.value)}
          rows={rows}
          placeholder={placeholder || label}
          className="w-full px-3 py-2 rounded text-sm outline-none resize-y"
          style={{
            backgroundColor: NAVY,
            color: TEXT_LT,
            border: `1px solid ${GOLD}15`,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
          onBlur={(e) => { e.currentTarget.style.borderColor = GOLD + "15" }}
        />
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>{label}</p>
      <input
        type="text"
        value={val}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-3 py-2 rounded text-sm outline-none"
        style={{
          backgroundColor: NAVY,
          color: TEXT_LT,
          border: `1px solid ${GOLD}15`,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
        onBlur={(e) => { e.currentTarget.style.borderColor = GOLD + "15" }}
      />
    </div>
  )
}
