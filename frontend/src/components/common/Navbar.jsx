import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin, Sun, Moon, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NAV_LINKS = [
  { to: '/',               label: 'Inicio'        },
  { to: '/programas',      label: 'Programas'     },
  { to: '/postas-rurales', label: 'Red Rural'      },
  { to: '/transparencia',  label: 'Transparencia' },
  { to: '/contacto',       label: 'Contacto'      },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { dark, toggle } = useTheme();

  const bg      = dark ? '#1e293b' : '#ffffff';
  const border  = dark ? '#334155' : '#f1f5f9';
  const text    = dark ? '#f1f5f9' : '#374151';
  const subtext = dark ? '#94a3b8' : '#6b7280';
  const active  = dark ? 'rgba(59,130,246,0.2)' : '#eff6ff';
  const activeT = dark ? '#93c5fd' : '#1d4ed8';
  const hover   = dark ? 'rgba(255,255,255,0.05)' : '#f9fafb';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: bg, borderBottom: `1px solid ${border}`,
      boxShadow: dark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'background 0.2s, border-color 0.2s',
    }}>

      {/* Barra superior */}
      <div style={{ background: '#1e3a5f', color: 'white', fontSize: '12px', padding: '6px 16px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> Navidad, Región del Libertador O'Higgins
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={12} /> +56 72 241 2345
          </span>
        </div>
      </div>

      {/* Nav principal */}
      <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', minHeight: 0, minWidth: 0 }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '13px' }}>CV</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: text }}>CESFAM</div>
            <div style={{ fontSize: '11px', color: subtext }}>Valle Mar • Navidad</div>
          </div>
        </Link>

        {/* Links desktop (sin Mis Exámenes) */}
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '2px' }} className="hide-mobile">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} style={{
                display: 'block', padding: '8px 14px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '13px', fontWeight: '500',
                background: pathname === to ? active : 'transparent',
                color: pathname === to ? activeT : text,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (pathname !== to) e.currentTarget.style.background = hover }}
              onMouseLeave={e => { if (pathname !== to) e.currentTarget.style.background = 'transparent' }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Derecha: modo oscuro + Mis Exámenes + Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Botón modo oscuro */}
          <button
            onClick={toggle}
            aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{
              width: '38px', height: '38px', borderRadius: '10px',
              border: `1.5px solid ${border}`,
              background: dark ? '#334155' : '#f8fafc',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: dark ? '#fbbf24' : '#374151',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = dark ? '#475569' : '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = dark ? '#334155' : '#f8fafc'}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* MIS EXÁMENES (destacado) */}
          <Link
            to="/examenes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: dark ? 'rgba(59,130,246,0.2)' : '#dbeafe',
              border: `1px solid ${dark ? 'rgba(59,130,246,0.5)' : '#bfdbfe'}`,
              color: dark ? '#93c5fd' : '#1e40af',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = dark ? 'rgba(59,130,246,0.3)' : '#bfdbfe';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = dark ? 'rgba(59,130,246,0.2)' : '#dbeafe';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FileText size={16} />
            Mis Exámenes
          </Link>

          {/* Botón Admin (solo visible en desktop) */}
          <Link to="/admin/login" className="hide-mobile" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '10px',
            background: 'linear-gradient(to right,#1e3a5f,#2563eb)',
            color: 'white', textDecoration: 'none',
            fontSize: '13px', fontWeight: '600',
          }}>
            Admin
          </Link>

          {/* Menú móvil */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="show-mobile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: text, padding: '6px' }}
            aria-label="Menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Menú móvil desplegado */}
      {menuOpen && (
        <div style={{ borderTop: `1px solid ${border}`, background: bg, padding: '12px 16px' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '12px 16px', borderRadius: '10px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '500',
              color: pathname === to ? activeT : text,
              background: pathname === to ? active : 'transparent',
              marginBottom: '2px',
            }}>
              {label}
            </Link>
          ))}
          {/* Enlace a Mis Exámenes también en móvil */}
          <Link to="/examenes" onClick={() => setMenuOpen(false)} style={{
            display: 'block', padding: '12px 16px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '14px', fontWeight: '600',
            background: '#dbeafe', color: '#1e40af', marginTop: '8px',
          }}>
            📄 Mis Exámenes
          </Link>
          <Link to="/admin/login" onClick={() => setMenuOpen(false)} style={{
            display: 'block', padding: '12px 16px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '14px', fontWeight: '600',
            color: '#2563eb', marginTop: '4px',
          }}>
            → Panel Admin
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;