import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GitBranch, Calendar, Layers, Users, FileText, Shield, LogOut, Sparkles, Megaphone, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import SelectorMalla from './SelectorMalla'
import { useState } from 'react'

// ── Paleta del sidebar (tono claro: celeste grisáceo + texto navy) ──────────
const SIDEBAR_BG   = '#D9E0E8'   // celeste grisáceo (plomo claro)
const NAVY         = '#0A1628'   // texto principal / acento
const TEXT_DIM     = '#16243B'   // texto secundario (azul muy oscuro, legible)
const GOLD         = '#C5A028'   // acento activo (solo bordes, no texto)
const BORDER       = 'rgba(10,22,40,0.10)'
const ACTIVE_BG    = 'rgba(197,160,40,0.18)'

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={() => {
        const path = window.location.pathname
        const active = to === '/dashboard' ? path === '/dashboard' : path === to || path.startsWith(to + '/')
        return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[rgba(10,22,40,0.06)] ${
          active ? 'font-semibold' : ''
        }`
      }}
      style={() => {
        const path = window.location.pathname
        const active = to === '/dashboard' ? path === '/dashboard' : path === to || path.startsWith(to + '/')
        return {
          color: active ? NAVY : TEXT_DIM,
          fontWeight: active ? 600 : 400,
          backgroundColor: active ? ACTIVE_BG : undefined,
          borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
        }
      }}
    >
      <Icon size={17} />
      {label}
    </NavLink>
  )
}

const baseNavItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Inicio' },
  { to: '/malla',      icon: GitBranch,       label: 'Malla Curricular' },
  { to: '/calendario', icon: Calendar,        label: 'Calendario' },
  { to: '/unidades',   icon: Layers,          label: 'Unidades de Competencia' },
  { to: '/docentes',   icon: Users,           label: 'Docentes' },
]

const adminNavItems = [
  {
    header: 'Gestión de Usuarios',
    items: [
      { to: '/admin/usuarios', icon: Users,  label: 'Administración de Usuarios' },
      { to: '/admin/roles',    icon: Shield, label: 'Roles y Permisos' },
    ],
  },
  {
    header: 'Gestión de Planificación',
    items: [
      { to: '/admin/mallas',      icon: GitBranch, label: 'Administración de Malla Curricular' },
      { to: '/admin/calendario',  icon: Calendar,  label: 'Administración de Calendarios' },
      { to: '/admin/unidades',    icon: Layers,    label: 'Unidades de Competencia' },
      { to: '/admin/recomendaciones', icon: Sparkles, label: 'Recomendaciones IA' },
    ],
  },
  {
    header: 'Presentación',
    items: [
      { to: '/admin/presentacion', icon: Megaphone, label: 'Presentación' },
    ],
  },
  {
    header: 'Seguridad',
    items: [
      { to: '/admin/logs', icon: FileText, label: 'Logs del Sistema' },
    ],
  },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isSuperAdmin, isAdmin } = usePermissions()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const canAdmin = isSuperAdmin || isAdmin

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#E8ECEF' }}>

      {/* ── Mobile overlay ───────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col shrink-0 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        {/* Marca */}
        <div className="px-6 py-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <p
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: NAVY }}
            >
              Sistema de Planificación Académica
            </p>
            <h1 className="font-heading text-xl font-semibold mt-1 leading-tight" style={{ color: NAVY }}>
              SISPLANECEME
            </h1>
          </div>
          <button
            className="lg:hidden p-1 rounded"
            onClick={() => setSidebarOpen(false)}
            style={{ color: NAVY }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" onClick={() => setSidebarOpen(false)}>
          {baseNavItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          {/* Separador y secciones admin */}
          {canAdmin && (
            <>
              <div className="pt-4 mt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                <p className="text-[10px] uppercase tracking-widest px-3 mb-2 font-semibold" style={{ color: NAVY }}>
                  Administración
                </p>
              </div>
              {adminNavItems.map((section) => (
                <div key={section.header}>
                  <p className="text-[10px] uppercase tracking-widest px-3 mt-2 mb-1 font-semibold" style={{ color: TEXT_DIM }}>
                    {section.header}
                  </p>
                  {section.items.map((item) => (
                    <NavItem key={item.to} {...item} />
                  ))}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Footer del sidebar */}
        <div className="px-4 py-4 space-y-2" style={{ borderTop: `1px solid ${BORDER}` }}>
          {user && (
            <div className="px-2 mb-1">
              <p className="text-xs font-medium truncate" style={{ color: NAVY }}>{user.nombre}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: TEXT_DIM }}>
                {user.roles?.join(', ') || 'Sin rol'}
              </p>
            </div>
          )}
          <p className="text-xs px-2" style={{ color: TEXT_DIM, opacity: 0.8 }}>Plan de Estudios 2026</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ borderLeft: '3px solid transparent', color: TEXT_DIM }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(10,22,40,0.06)'; e.currentTarget.style.color = '#B91C1C' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = TEXT_DIM }}
          >
            <LogOut size={15} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Área de contenido ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="px-4 md:px-8 py-3 md:py-4 shrink-0 border-b border-white/10"
          style={{ backgroundColor: '#0A1628' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1 rounded"
                onClick={() => setSidebarOpen(true)}
                style={{ color: GOLD }}
              >
                <Menu size={22} />
              </button>
              <div>
                <h2 className="font-heading text-base md:text-lg font-medium text-white">
                  Plan de Estudios
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SelectorMalla />
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#C5A028' }}
                />
                <span className="text-xs text-white/45">En ejecución</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
