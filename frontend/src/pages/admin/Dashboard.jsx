import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

/* ── Ícono SVG simple ────────────────────────────────────── */
const IconBox = ({ bg, children }) => (
  <div style={{
    width: '40px', height: '40px', borderRadius: '12px',
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '18px', flexShrink: 0,
  }}>
    {children}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ programas: '…', postas: '…', noticias: '…' });
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();

  // Colores según tema
  const C = {
    page:    dark ? '#0f172a' : '#f1f5f9',
    card:    dark ? '#1e293b' : '#ffffff',
    border:  dark ? '#334155' : '#e2e8f0',
    textP:   dark ? '#f1f5f9' : '#0f172a',
    textS:   dark ? '#94a3b8' : '#64748b',
    textM:   dark ? '#64748b' : '#94a3b8',
    hover:   dark ? '#273549' : '#f8fafc',
    hoverB:  dark ? '#475569' : '#cbd5e1',
    itemBg:  dark ? '#0f172a' : '#f8fafc',
    shadow:  dark
      ? '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)'
      : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/programas?activo=true'),
      api.get('/api/postas'),
      api.get('/api/noticias?limit=1'),
    ])
      .then(([p, po, n]) => {
        setStats({
          programas: p.data.total ?? 0,
          postas:    po.data.total ?? 0,
          noticias:  n.data.pagination?.total ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // KPIs con colores adaptables
  const KPIS = [
    {
      emoji: '❤️',
      label: 'Programas activos',
      valor: loading ? '…' : stats.programas,
      sub:   'Todos operativos',
      bg:    dark ? 'rgba(244,63,94,0.2)'   : '#fff1f2',
      clr:   '#f43f5e',
    },
    {
      emoji: '🏥',
      label: 'Postas / Estaciones',
      valor: loading ? '…' : stats.postas,
      sub:   '3 Postas · 3 EMR',
      bg:    dark ? 'rgba(20,184,166,0.2)'  : '#f0fdfa',
      clr:   '#14b8a6',
    },
    {
      emoji: '📰',
      label: 'Noticias publicadas',
      valor: loading ? '…' : stats.noticias,
      sub:   'En el sistema',
      bg:    dark ? 'rgba(59,130,246,0.2)'  : '#eff6ff',
      clr:   '#3b82f6',
    },
    {
      emoji: '👤',
      label: 'Administradores',
      valor: '1',
      sub:   'Usuario activo',
      bg:    dark ? 'rgba(139,92,246,0.2)'  : '#f5f3ff',
      clr:   '#8b5cf6',
    },
  ];

  // Accesos rápidos con colores adaptables
  const ACCESOS = [
    { to: '/admin/programas', emoji: '❤️', bg: dark ? 'rgba(244,63,94,0.25)' : '#fff1f2', label: 'Gestionar Programas', desc: 'Crear, editar y eliminar' },
    { to: '/admin/noticias',  emoji: '📰', bg: dark ? 'rgba(59,130,246,0.25)' : '#eff6ff', label: 'Nueva Noticia',      desc: 'Publicar contenido' },
    { to: '/admin/horarios',  emoji: '🕐', bg: dark ? 'rgba(245,158,11,0.25)' : '#fffbeb', label: 'Editar Horarios',    desc: 'Actualizar boxes y lab' },
    { to: '/admin/postas',    emoji: '🏥', bg: dark ? 'rgba(20,184,166,0.25)' : '#f0fdfa', label: 'Gestionar Postas',    desc: 'Actualizar red rural' },
    { to: '/admin/analiticas',emoji: '📈', bg: dark ? 'rgba(139,92,246,0.25)' : '#f5f3ff', label: 'Ver Analíticas',     desc: 'Estadísticas del sitio' },
  ];

  // Actividad reciente con colores adaptables
  const ACTIVIDAD = [
    { emoji: '📰', texto: 'Noticia "Campaña Cardiovascular" publicada', tiempo: 'Hace 2 horas', bg: dark ? 'rgba(59,130,246,0.2)'  : '#eff6ff' },
    { emoji: '🕐', texto: 'Horario Box 3 actualizado',                  tiempo: 'Hace 5 horas', bg: dark ? 'rgba(245,158,11,0.2)'  : '#fffbeb' },
    { emoji: '🏥', texto: 'Posta Pupuya: horario modificado',           tiempo: 'Ayer 14:30',   bg: dark ? 'rgba(20,184,166,0.2)' : '#f0fdfa' },
    { emoji: '👤', texto: 'Sesión iniciada por Administrador',          tiempo: 'Hace 2 días',  bg: dark ? 'rgba(139,92,246,0.2)' : '#f5f3ff' },
  ];

  const card = (extra = {}) => ({
    background:   C.card,
    borderRadius: '16px',
    border:       `1px solid ${C.border}`,
    boxShadow:    C.shadow,
    transition:   'background 0.2s, border-color 0.2s',
    ...extra,
  });

  return (
    <AdminLayout>
      {/* Saludo */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: C.textP, display: 'flex', alignItems: 'center', gap: '8px' }}>
          ¡Bienvenido al Panel Admin! <span>👋</span>
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: C.textS }}>
          CESFAM Valle Mar ·{' '}
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {KPIS.map(k => (
          <div key={k.label} style={card({ padding: '20px' })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textS }}>{k.label}</p>
                <p style={{ margin: 0, fontSize: '34px', fontWeight: '800', color: C.textP, lineHeight: 1 }}>{k.valor}</p>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: C.textM }}>{k.sub}</p>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                {k.emoji}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos + Actividad */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Accesos rápidos */}
        <div style={card({ padding: '20px' })}>
          <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: C.textP, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚡</span> Acciones rápidas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ACCESOS.map(({ to, emoji, bg, label, desc }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px',
                textDecoration: 'none', border: `1px solid ${C.border}`, background: 'transparent', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.hover; e.currentTarget.style.borderColor = C.hoverB; e.currentTarget.style.transform = 'translateX(3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <IconBox bg={bg}>{emoji}</IconBox>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: C.textP }}>{label}</div>
                  <div style={{ fontSize: '11px', color: C.textS, marginTop: '1px' }}>{desc}</div>
                </div>
                <span style={{ fontSize: '14px', color: C.textM }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={card({ padding: '20px' })}>
          <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: C.textP, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🕐</span> Actividad reciente
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ACTIVIDAD.map(({ emoji, texto, tiempo, bg }, i, arr) => (
              <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', color: C.textP, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{texto}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.textS }}>{tiempo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div style={card({ padding: '20px' })}>
        <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: C.textP, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🖥️</span> Estado del sistema
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
          {[
            { label: 'API Backend',    puerto: 'localhost:3000', ok: true },
            { label: 'Base de Datos',  puerto: 'PostgreSQL',     ok: true },
            { label: 'Frontend',       puerto: 'localhost:5173', ok: true },
            { label: 'pnpm Workspace', puerto: 'Configurado',    ok: true },
          ].map(({ label, puerto, ok }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: C.itemBg, border: `1px solid ${C.border}` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444', boxShadow: ok ? '0 0 0 3px rgba(34,197,94,0.2)' : '0 0 0 3px rgba(239,68,68,0.2)', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: C.textP }}>{label}</p>
                <p style={{ margin: '1px 0 0', fontSize: '11px', color: C.textS }}>{puerto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;