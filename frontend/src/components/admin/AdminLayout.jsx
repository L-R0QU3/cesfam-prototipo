import { useState }                          from 'react'
import { Link, useLocation, useNavigate }    from 'react-router-dom'
import { Sun, Moon }                         from 'lucide-react'
import { useAuth }                           from '../../context/AuthContext'
import { useTheme }                          from '../../context/ThemeContext'

const NAV = [
  { to: '/admin/dashboard',  emoji: '📊', label: 'Dashboard'   },
  { to: '/admin/programas',  emoji: '❤️',  label: 'Programas'  },
  { to: '/admin/noticias',   emoji: '📰', label: 'Noticias'    },
  { to: '/admin/alertas', emoji: '⚠️', label: 'Alertas' },
  { to: '/admin/banners', emoji: '🖼️', label: 'Banners' },
  { to: '/admin/horarios',   emoji: '🕐', label: 'Horarios'    },
  { to: '/admin/postas',     emoji: '🏥', label: 'Postas'      },
  { to: '/admin/analiticas', emoji: '📈', label: 'Analíticas'  },
  { to: '/admin/examenes', emoji: '🔬', label: 'Exámenes' }
]

const AdminLayout = ({ children }) => {
  const [open, setOpen]       = useState(true)
  const { pathname }          = useLocation()
  const { user, logout }      = useAuth()
  const { dark, toggle }      = useTheme()
  const navigate              = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin/login') }

  // Colores según tema
  const cardBg   = dark ? '#1e293b' : '#ffffff'
  const pageBg   = dark ? '#0f172a' : '#f8fafc'
  const border   = dark ? '#334155' : '#f1f5f9'
  const textP    = dark ? '#f1f5f9' : '#111827'
  const textS    = dark ? '#94a3b8' : '#6b7280'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: pageBg, transition: 'background 0.2s' }}>

      {/* Sidebar */}
      <aside style={{
        width: open ? '220px' : '60px',
        background: '#1e3a5f',
        color: 'white', display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'fixed', inset: '0 auto 0 0', zIndex: 30,
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          {open && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>CV</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '12px', fontWeight: '700' }}>CESFAM</div>
                <div style={{ fontSize: '10px', color: '#93c5fd' }}>Valle Mar</div>
              </div>
            </div>
          )}
          <button onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', padding: '4px', marginLeft: open ? '0' : 'auto', marginRight: open ? '0' : 'auto' }}>
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(({ to, emoji, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} title={!open ? label : undefined} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', background: active ? 'rgba(255,255,255,0.18)' : 'transparent', color: active ? 'white' : '#93c5fd', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{emoji}</span>
                {open && label}
              </Link>
            )
          })}
        </nav>

        {/* Toggle tema + logout */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          {/* Toggle modo oscuro */}
          <button onClick={toggle} title={!open ? (dark ? 'Modo claro' : 'Modo oscuro') : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', color: dark ? '#fbbf24' : '#93c5fd', cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', justifyContent: open ? 'flex-start' : 'center', marginBottom: '4px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{dark ? '☀️' : '🌙'}</span>
            {open && (dark ? 'Modo claro' : 'Modo oscuro')}
          </button>

          {/* Info usuario */}
          {open && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                {user.nombre?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nombre}</div>
                <div style={{ fontSize: '10px', color: '#93c5fd' }}>{user.rol}</div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button onClick={handleLogout} title={!open ? 'Cerrar sesión' : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', justifyContent: open ? 'flex-start' : 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>🚪</span>
            {open && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div style={{ marginLeft: open ? '220px' : '60px', flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.25s ease', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{ height: '60px', background: cardBg, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 20, transition: 'background 0.2s' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: textP }}>{NAV.find(n => n.to === pathname)?.label ?? 'Admin'}</div>
            <div style={{ fontSize: '11px', color: textS }}>CESFAM Valle Mar</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Ver sitio →</a>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' }}>
              {user?.nombre?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout