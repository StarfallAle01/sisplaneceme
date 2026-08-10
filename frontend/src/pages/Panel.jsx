import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Calendar, Layers, Users,
  GraduationCap, Clock, BarChart2, CheckCircle,
} from 'lucide-react'

const NAVY_DEEP = '#0A1628'   // normal
const NAVY_MID  = '#2B4C7A'   // hover
const DARK      = '#1E1F24'
const GOLD      = '#C5A028'
const VIOLET    = '#3D2B56'
const TEXT_LT   = '#E2E8F0'
const DIM_LT    = '#94A3B8'

const CARDS = [
  { Icon: BookOpen,  title: 'Malla Curricular',       desc: 'Estructura completa de ejes, módulos y unidades de competencia', route: '/malla' },
  { Icon: Calendar,  title: 'Calendario Académico',    desc: 'Planificación anual por semestres y carga horaria',             route: '/calendario' },
  { Icon: Layers,    title: 'Unidades de Competencia', desc: 'Listado completo de asignaturas y contenidos mínimos',          route: '/unidades' },
  { Icon: Users,     title: 'Plantel Docente',         desc: 'Gestión de profesores y personal académico',                   route: '/docentes' },
]

const INFO = [
  { Icon: GraduationCap, label: 'Modalidad', value: 'Maestría' },
  { Icon: Clock,         label: 'Total',      value: '3,202 hrs' },
  { Icon: BarChart2,     label: 'Semestres',  value: '4' },
  { Icon: Calendar,      label: 'Período',    value: '2026–2027' },
  { Icon: CheckCircle,   label: 'Estado',     value: 'En ejecución' },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">

      {/* ── Cabecera ───────────────────────────────────────────────────────── */}
      <div
        className="rounded-lg px-6 py-5"
        style={{ backgroundColor: NAVY_DEEP }}
      >
        <h1
          className="font-heading font-semibold"
          style={{ color: GOLD, fontSize: '28px' }}
        >
          Panel de Control
        </h1>
        <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
          Maestría · 3,202 horas académicas · 4 Semestres
        </p>
      </div>

      {/* ── Accesos rápidos ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CARDS.map(({ Icon, title, desc, route }) => (
          <button
            key={title}
            onClick={() => navigate(route)}
            className="text-left p-6 rounded-lg flex flex-col gap-4 transition-all"
            style={{
              backgroundColor: NAVY_DEEP,
              borderTop: `4px solid ${GOLD}`,
              borderRight: `1px solid rgba(212,175,55,0.2)`,
              borderBottom: `1px solid rgba(212,175,55,0.2)`,
              borderLeft: `1px solid rgba(212,175,55,0.2)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = NAVY_MID
              e.currentTarget.style.borderTopColor = VIOLET
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = NAVY_DEEP
              e.currentTarget.style.borderTopColor = GOLD
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Icon size={20} style={{ color: GOLD }} />
            <div>
              <p className="text-base font-medium" style={{ color: TEXT_LT }}>{title}</p>
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: DIM_LT }}>{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Panel de información institucional ─────────────────────────────── */}
      <div className="rounded-lg px-6 py-4" style={{ backgroundColor: DARK }}>
        <p className="text-xs uppercase tracking-widest mb-4 text-white/40">
          Información General
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {INFO.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} style={{ color: GOLD }} />
              <span className="text-sm text-white/50">{label}:</span>
              <span className="text-sm font-medium text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
