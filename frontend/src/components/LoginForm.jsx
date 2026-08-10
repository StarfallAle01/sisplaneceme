import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

const AZUL           = '#0A1628'
const DORADO         = '#C5A028'
const MARFIL         = '#E9ECF0'
const EBANO          = '#050505'
const VERDE_MILITAR  = '#333333'
const BEIGE_DORADO   = '#F5F0E2'

const ROL_CONFIG = {
  profesor: {
    title: 'Ingreso Profesor',
    roleCheck: (roles) => roles.includes('profesor'),
    backTo: '/login',
  },
  admin: {
    title: 'Ingreso Personal Administrativo',
    roleCheck: (roles) => roles.includes('admin') || roles.includes('super_admin'),
    backTo: '/login',
  },
}

export default function LoginForm({ role = 'profesor' }) {
  const navigate = useNavigate()
  const [ci, setCi]             = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [isDark, setIsDark]     = useState(false)

  const config = ROL_CONFIG[role] || ROL_CONFIG.profesor

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const input = ci.trim()

    let email
    if (input.includes('@')) {
      email = input
    } else {
      const { data: usuarioDB } = await supabase
        .from('usuarios')
        .select('email')
        .eq('ci', input)
        .maybeSingle()

      if (!usuarioDB?.email) {
        setError('CI no registrado en el sistema.')
        setLoading(false)
        return
      }
      email = usuarioDB.email
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Credenciales incorrectas. Verifique sus datos.')
      setLoading(false)
      return
    }

    let { data: userData } = await supabase
      .from('usuarios')
      .select('id, nombre, apellidos, grado')
      .eq(input.includes('@') ? 'email' : 'ci', input)
      .maybeSingle()

    if (!userData) {
      const { data: nuevo, error: createError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          email: data.user.email,
          ci: input.includes('@') ? '' : input,
          nombre: data.user.user_metadata?.nombre || '',
          apellidos: data.user.user_metadata?.apellidos || '',
          grado: data.user.user_metadata?.grado || '',
          activo: true,
        })
        .select('id, nombre, apellidos, grado')
        .single()

      if (createError) {
        console.error('Error al crear usuario:', createError)
        await supabase.auth.signOut()
        setError('Error al sincronizar usuario. Contacte al administrador.')
        setLoading(false)
        return
      }
      userData = nuevo
    } else if (userData.id !== data.user.id) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ id: data.user.id })
        .eq('id', userData.id)
      if (updateError) {
        console.error('Error al sincronizar UUID:', updateError)
      } else {
        userData = { ...userData, id: data.user.id }
      }
    }

    const efectivoId = userData.id
    const { data: rolData } = await supabase
      .from('usuarios_roles')
      .select('roles(nombre)')
      .eq('usuario_id', efectivoId)

    const roles = (rolData || []).map(r => r.roles?.nombre).filter(Boolean)

    if (!config.roleCheck(roles)) {
      await supabase.auth.signOut()
      setError('Acceso no autorizado para este perfil.')
      setLoading(false)
      return
    }

    localStorage.setItem('auth', 'true')
    localStorage.setItem('rol', roles.join(','))
    localStorage.setItem('userName', `${userData.nombre} ${userData.apellidos}`)
    navigate('/dashboard')
  }

  const bgGradientStart = isDark ? AZUL : BEIGE_DORADO
  const bgGradientEnd   = isDark ? '#111B2C' : '#E8DFC8'
  const cardBg           = isDark ? VERDE_MILITAR : AZUL
  const cardBorder       = isDark ? `${DORADO}35` : `${DORADO}50`
  const dividerColor     = isDark ? `${DORADO}20` : `${DORADO}25`
  const titleColor       = MARFIL
  const subtitleColor    = isDark ? `${MARFIL}60` : `${MARFIL}60`
  const labelColor       = isDark ? `${MARFIL}60` : `${MARFIL}55`
  const inputBg          = isDark ? '#ffffff0A' : '#ffffff10'
  const inputBorder      = isDark ? `${DORADO}30` : `${DORADO}45`
  const inputFocusBorder = DORADO
  const copyrightColor   = isDark ? `${MARFIL}25` : `${EBANO}30`

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
      style={{
        background: `linear-gradient(180deg, ${bgGradientStart} 0%, ${bgGradientEnd} 100%)`,
      }}
    >
      {/* Toggle Modo Día/Noche */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 px-4 py-2 rounded text-lg transition-all hover:opacity-80"
        style={{
          color: DORADO,
          border: `1px solid ${DORADO}40`,
          backgroundColor: isDark ? 'transparent' : `${AZUL}06`,
        }}
        title={isDark ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isDark ? (
            <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
          ) : (
            <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>
          )}
        </svg>
      </button>

      {/* Contenedor tipo tarjeta */}
      <div
        className="w-full max-w-md rounded-xl overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0,0,0,0.6)'
            : '0 20px 40px -12px rgba(27,38,59,0.25)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 pt-10 pb-6 text-center"
          style={{ borderBottom: `1px solid ${dividerColor}` }}
        >
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${DORADO}15`,
              border: `2px solid ${DORADO}45`,
            }}
          >
            <img
              src="/logoeceme.png"
              alt="ECEME"
              className="w-full h-full object-contain p-1.5"
            />
          </div>

          <p
            className="text-xs uppercase tracking-widest font-medium mb-3"
            style={{ color: DORADO, opacity: 0.9 }}
          >
            ECEME
          </p>
          <div className="h-px w-12 mx-auto mb-4" style={{ backgroundColor: DORADO, opacity: 0.5 }} />
          <h1
            className="text-xl font-medium mb-1"
            style={{ color: titleColor }}
          >
            {config.title}
          </h1>
          <p className="text-sm" style={{ color: subtitleColor }}>
            Verifica tu identidad con CI
          </p>
        </div>

        {/* Formulario */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo: Carnet de Identidad */}
            <div>
              <label
                className="block text-sm font-medium uppercase tracking-wider mb-2"
                style={{ color: labelColor }}
              >
                CI o Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DORADO} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <path d="M8 21h8M12 17v4"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={ci}
                  onChange={(e) => { setCi(e.target.value); setError('') }}
                  className="w-full pl-11 pr-4 py-3 rounded text-base outline-none transition-all"
                  style={{
                    backgroundColor: inputBg,
                    color: MARFIL,
                    border: `1px solid ${inputBorder}`,
                  }}
                  placeholder="Número de CI o email"
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = inputFocusBorder
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${DORADO}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = inputBorder
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div>
              <label
                className="block text-sm font-medium uppercase tracking-wider mb-2"
                style={{ color: labelColor }}
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DORADO} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="w-full pl-11 pr-11 py-3 rounded text-base outline-none transition-all"
                  style={{
                    backgroundColor: inputBg,
                    color: MARFIL,
                    border: `1px solid ${inputBorder}`,
                  }}
                  placeholder="••••••••"
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = inputFocusBorder
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${DORADO}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = inputBorder
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                  style={{ color: DORADO }}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <path d="M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div
                className="text-sm text-center py-3 px-4 rounded flex items-center justify-center gap-2"
                style={{
                  color: '#E8C56D',
                  backgroundColor: '#E8C56D15',
                  border: '1px solid #E8C56D35',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
                {error}
              </div>
            )}

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded text-base font-medium transition-all text-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: DORADO,
                color: AZUL,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#D4B84C'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(197,160,89,0.35)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = DORADO
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span className="flex items-center justify-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
                </svg>
                {loading ? 'Verificando...' : 'Ingresar'}
              </span>
            </button>
          </form>
        </div>

        {/* Indicador de sistema seguro */}
        <div className="px-8 pb-4 text-center">
          <p
            className="text-xs flex items-center justify-center gap-1.5"
            style={{ color: `${DORADO}50` }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Conexión segura
          </p>
        </div>

        {/* Footer de la tarjeta */}
        <div
          className="px-8 py-5 text-center"
          style={{
            borderTop: `1px solid ${dividerColor}`,
            backgroundColor: isDark ? '#ffffff04' : '#ffffff08',
          }}
        >
          <button
            onClick={() => navigate(config.backTo)}
            className="text-sm transition-all hover:opacity-100 inline-flex items-center gap-1.5"
            style={{ color: `${MARFIL}70` }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
        </div>
      </div>

      {/* Copyright fuera de la tarjeta */}
      <p
        className="text-xs mt-8"
        style={{ color: copyrightColor }}
      >
        © 2026 ECEME — Bolivia
      </p>
    </div>
  )
}
