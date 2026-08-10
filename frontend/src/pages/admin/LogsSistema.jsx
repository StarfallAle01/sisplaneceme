import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import {
  FileText, Filter, Loader2, AlertCircle,
  RefreshCw, Clock, User, Database,
} from 'lucide-react'

const NAVY      = '#0A1628'
const GOLD      = '#C5A028'
const TEXT_LT   = '#E2E8F0'
const DIM_LT    = '#94A3B8'

const ACCION_LABELS = {
  create: 'Creacion',
  update: 'Actualizacion',
  delete: 'Eliminacion',
  login: 'Inicio de sesion',
  view: 'Visualizacion',
}

const ACCION_COLORS = {
  create: '#10B981',
  update: '#3B82F6',
  delete: '#EF4444',
  login:  '#F59E0B',
  view:   '#6B7280',
}

export default function LogsSistema() {
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const [filtroAccion, setFiltroAccion] = useState('')
  const [filtroTabla,  setFiltroTabla]  = useState('')
  const [limit, setLimit] = useState(100)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = { limit }
      if (filtroAccion) params.accion = filtroAccion
      if (filtroTabla)  params.tabla  = filtroTabla

      const { data } = await api.get('/logs', { params })
      setLogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filtroAccion, filtroTabla, limit])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString('es-BO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }

  const formatJson = (json) => {
    if (!json) return '-'
    try {
      const obj = typeof json === 'string' ? JSON.parse(json) : json
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(json)
    }
  }

  const TABLAS = [...new Set(logs.map(l => l.tabla_afectada).filter(Boolean))]

  return (
    <div className="space-y-6">

      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '28px' }}>
          Logs del Sistema
        </h1>
        <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
          Registro de todas las operaciones realizadas en el sistema
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2" style={{ color: DIM_LT }}>
          <Filter size={14} />
          <select
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: NAVY, color: TEXT_LT, border: `1px solid ${GOLD}20` }}
          >
            <option value="" style={{ backgroundColor: NAVY }}>Todas las acciones</option>
            {Object.entries(ACCION_LABELS).map(([k, v]) => (
              <option key={k} value={k} style={{ backgroundColor: NAVY }}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2" style={{ color: DIM_LT }}>
          <Database size={14} />
          <select
            value={filtroTabla}
            onChange={(e) => setFiltroTabla(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: NAVY, color: TEXT_LT, border: `1px solid ${GOLD}20` }}
          >
            <option value="" style={{ backgroundColor: NAVY }}>Todas las tablas</option>
            {TABLAS.map((t) => (
              <option key={t} value={t} style={{ backgroundColor: NAVY }}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2" style={{ color: DIM_LT }}>
          <span className="text-xs">Mostrar:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="px-2 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: NAVY, color: TEXT_LT, border: `1px solid ${GOLD}20` }}
          >
            {[25, 50, 100, 200, 500].map(n => (
              <option key={n} value={n} style={{ backgroundColor: NAVY }}>{n}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: DIM_LT, backgroundColor: NAVY, border: `1px solid ${GOLD}20` }}
          onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
        >
          <RefreshCw size={14} /> Refrescar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#7F1D1D20', border: '1px solid #7F1D1D40', color: '#FCA5A5' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20" style={{ color: DIM_LT }}>
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" /> Cargando logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
          <FileText size={48} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
          <p style={{ color: TEXT_LT }}>No se encontraron logs.</p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.15)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: `${NAVY}CC`, borderBottom: `1px solid ${GOLD}20` }}>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Fecha</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Usuario</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Accion</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Tabla</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors"
                  style={{ backgroundColor: NAVY, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2B4C7A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} style={{ color: DIM_LT }} />
                      <span style={{ color: DIM_LT, fontSize: '11px' }}>{formatDate(log.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <User size={10} style={{ color: DIM_LT }} />
                      <span style={{ color: TEXT_LT, fontSize: '12px' }}>
                        {log.usuario_email || log.usuario_id || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${ACCION_COLORS[log.accion] || '#6B7280'}20`,
                        color: ACCION_COLORS[log.accion] || '#6B7280',
                      }}
                    >
                      {ACCION_LABELS[log.accion] || log.accion}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span style={{ color: DIM_LT, fontSize: '11px' }}>{log.tabla_afectada || '-'}</span>
                  </td>
                  <td className="px-3 py-3 max-w-xs">
                    <pre className="text-[10px] whitespace-pre-wrap break-all" style={{ color: DIM_LT }}>
                      {formatJson(log.detalles)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-right" style={{ color: DIM_LT, fontSize: '12px' }}>
        Mostrando {logs.length} registros
      </div>
    </div>
  )
}
