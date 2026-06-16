import { MapPin, Clock, Phone, User } from 'lucide-react'
import { useTheme }                   from '../context/ThemeContext'
import useFetch                       from '../hooks/useFetch'

const POSTAS_CONFIG = {
  posta:    { emoji: '🏥', label: 'Posta Rural',           bgLight: '#eff6ff', bgDark: 'rgba(59,130,246,0.12)',  badgeB: '#2563eb' },
  estacion: { emoji: '🏕️', label: 'Estación Médica Rural', bgLight: '#f0fdf4', bgDark: 'rgba(16,185,129,0.12)', badgeB: '#059669' },
}

const PostaCard = ({ posta, dark }) => {
  const cfg = POSTAS_CONFIG[posta.tipo] ?? POSTAS_CONFIG.posta

  const C = {
    card:   dark ? '#1e293b' : '#ffffff',
    border: dark ? '#334155' : '#e5e7eb',
    textP:  dark ? '#f1f5f9' : '#111827',
    textS:  dark ? '#94a3b8' : '#6b7280',
    iconBg: dark ? cfg.bgDark : cfg.bgLight,
    shadow: dark ? '0 1px 4px rgba(0,0,0,0.35)' : '0 1px 4px rgba(0,0,0,0.07)',
  }

  return (
    <div
      style={{
        background:   C.card,
        borderRadius: '16px',
        border:       `1px solid ${C.border}`,
        padding:      '20px',
        boxShadow:    C.shadow,
        transition:   'transform 0.2s, box-shadow 0.2s, background 0.2s',
        display:      'flex',
        alignItems:   'flex-start',
        gap:          '14px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'translateY(-3px)'
        e.currentTarget.style.boxShadow  = dark
          ? '0 6px 20px rgba(0,0,0,0.4)'
          : '0 6px 20px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = 'translateY(0)'
        e.currentTarget.style.boxShadow  = C.shadow
      }}
    >
      {/* Ícono */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: C.iconBg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', flexShrink: 0,
      }}>
        {cfg.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badge */}
        <span style={{
          display: 'inline-block', padding: '3px 10px',
          borderRadius: '20px', fontSize: '11px', fontWeight: '700',
          background: cfg.badgeB, color: 'white',
          marginBottom: '8px',
        }}>
          {cfg.label}
        </span>

        <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '700', color: C.textP }}>
          {posta.nombre}
        </h3>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.textS }}>
            <MapPin size={13} style={{ flexShrink: 0, color: dark ? '#64748b' : '#9ca3af' }} />
            {posta.ubicacion}
          </li>
          {posta.horario_atencion && (
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.textS }}>
              <Clock size={13} style={{ flexShrink: 0, color: dark ? '#64748b' : '#9ca3af' }} />
              {posta.horario_atencion}
            </li>
          )}
          {posta.encargado && (
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.textS }}>
              <User size={13} style={{ flexShrink: 0, color: dark ? '#64748b' : '#9ca3af' }} />
              {posta.encargado}
            </li>
          )}
          {posta.telefono && (
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.textS }}>
              <Phone size={13} style={{ flexShrink: 0, color: dark ? '#64748b' : '#9ca3af' }} />
              {posta.telefono}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

const PostasRurales = () => {
  const { data, loading, error } = useFetch('/api/postas')
  const { dark } = useTheme()

  const C = {
    page:   dark ? '#0f172a' : '#f8fafc',
    textP:  dark ? '#f1f5f9' : '#111827',
    textS:  dark ? '#94a3b8' : '#6b7280',
    spinClr:dark ? '#334155' : '#e5e7eb',
  }

  const postas     = data?.data?.filter(p => p.tipo === 'posta')    ?? []
  const estaciones = data?.data?.filter(p => p.tipo === 'estacion') ?? []

  return (
    <main style={{ background: C.page, minHeight: '100vh', transition: 'background 0.2s' }}>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(to right, #0f766e, #0d9488)', padding: '56px 16px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ color: '#99f6e4', fontSize: '13px', marginBottom: '8px' }}>CESFAM Valle Mar</p>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,5vw,40px)', fontWeight: '800', margin: '0 0 8px' }}>
            Red Rural de Atención
          </h1>
          <p style={{ color: '#ccfbf1', maxWidth: '480px', margin: 0, lineHeight: 1.6 }}>
            Cobertura en toda la comuna de Navidad: 3 Postas Rurales y 3 Estaciones Médicas.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px', color: C.textS }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: `4px solid ${C.spinClr}`,
              borderTopColor: '#0d9488',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            Cargando postas rurales…
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: '#ef4444', textAlign: 'center', padding: '32px' }}>{error}</p>
        )}

        {/* Contenido */}
        {!loading && !error && (
          <>
            {/* Postas */}
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: C.textP, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏥 Postas Rurales
                <span style={{ fontSize: '14px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: dark ? 'rgba(59,130,246,0.15)' : '#dbeafe', color: dark ? '#93c5fd' : '#1d4ed8' }}>
                  {postas.length}
                </span>
              </h2>
              {postas.length === 0 ? (
                <p style={{ color: C.textS }}>No hay postas registradas.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                  {postas.map(p => <PostaCard key={p.id} posta={p} dark={dark} />)}
                </div>
              )}
            </div>

            {/* Estaciones */}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: C.textP, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏕️ Estaciones Médicas Rurales
                <span style={{ fontSize: '14px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: dark ? 'rgba(16,185,129,0.15)' : '#ccfbf1', color: dark ? '#6ee7b7' : '#065f46' }}>
                  {estaciones.length}
                </span>
              </h2>
              {estaciones.length === 0 ? (
                <p style={{ color: C.textS }}>No hay estaciones registradas.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                  {estaciones.map(p => <PostaCard key={p.id} posta={p} dark={dark} />)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default PostasRurales