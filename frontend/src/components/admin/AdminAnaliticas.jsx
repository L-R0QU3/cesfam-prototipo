import { useTheme } from '../../context/ThemeContext'
import AdminLayout  from '../../components/admin/AdminLayout'

const BARS = [
  { mes: 'Sep', v: 1820 }, { mes: 'Oct', v: 2100 },
  { mes: 'Nov', v: 1950 }, { mes: 'Dic', v: 2400 },
  { mes: 'Ene', v: 2650 }, { mes: 'Feb', v: 2847 },
]
const MAX = Math.max(...BARS.map(b => b.v))

const PAGINAS = [
  { url: '/programas',      v: 856, pct: 30 },
  { url: '/postas-rurales', v: 742, pct: 26 },
  { url: '/',               v: 685, pct: 24 },
  { url: '/transparencia',  v: 312, pct: 11 },
  { url: '/contacto',       v: 252, pct:  9 },
]

const AdminAnaliticas = () => {
  const { dark } = useTheme()

  const C = {
    card:   dark ? '#1e293b' : '#ffffff',
    border: dark ? '#334155' : '#f1f5f9',
    textP:  dark ? '#f1f5f9' : '#111827',
    textS:  dark ? '#94a3b8' : '#6b7280',
    barBg:  dark ? '#0f172a' : '#f1f5f9',
    progBg: dark ? '#0f172a' : '#f1f5f9',
  }

  const KPIS = [
    { emoji: '👁️', label: 'Visitas este mes', valor: '2,847', bg: dark ? '#1e3a5f' : '#dbeafe' },
    { emoji: '📈', label: 'Vs mes anterior',  valor: '+12%',  bg: dark ? '#14532d' : '#dcfce7' },
    { emoji: '⏱️', label: 'Tiempo promedio',  valor: '3m 45s',bg: dark ? '#451a03' : '#fef3c7' },
    { emoji: '📱', label: 'Desde móvil',      valor: '65%',   bg: dark ? '#3b1f6e' : '#ede9fe' },
  ]

  const card = (extra = {}) => ({ background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)', ...extra })

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: C.textP }}>Analíticas</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textS }}>Estadísticas de visitas del sitio web</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px', marginBottom: '24px' }}>
        {KPIS.map(({ emoji, label, valor, bg }) => (
          <div key={label} style={card({ padding: '18px' })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: C.textS, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: C.textP }}>{valor}</div>
              </div>
              <div style={{ width: '38px', height: '38px', background: bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{emoji}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Gráfico barras */}
        <div style={card({ padding: '20px' })}>
          <h2 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '700', color: C.textP }}>Visitas por mes</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px' }}>
            {BARS.map(({ mes, v }) => (
              <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: C.textS }}>{v.toLocaleString()}</span>
                <div style={{ width: '100%', background: '#3b82f6', borderRadius: '6px 6px 0 0', height: `${(v/MAX)*100}%`, minHeight: '4px', transition: 'height 0.5s', opacity: dark ? 0.85 : 1 }} />
                <span style={{ fontSize: '11px', color: C.textS, fontWeight: '500' }}>{mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Páginas más visitadas */}
        <div style={card({ padding: '20px' })}>
          <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: C.textP }}>Páginas más visitadas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PAGINAS.map(({ url, v, pct }) => (
              <div key={url}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', color: C.textP, fontWeight: '500' }}>{url}</span>
                  <span style={{ fontSize: '12px', color: C.textS }}>{v.toLocaleString()}</span>
                </div>
                <div style={{ height: '6px', background: C.progBg, borderRadius: '3px' }}>
                  <div style={{ height: '100%', background: '#3b82f6', borderRadius: '3px', width: `${pct}%`, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminAnaliticas