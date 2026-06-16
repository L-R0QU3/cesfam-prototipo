import { BarChart2, Target, TrendingUp, Award } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const INDICADORES = [
  {
    icon:        BarChart2,
    titulo:      'Cobertura Programa Cardiovascular',
    valor:       '78%',
    meta:        '80%',
    progreso:    78,
    barColor:    '#f97316',
    iconBg:      { light: '#fff7ed', dark: 'rgba(249,115,22,0.15)' },
    iconColor:   '#f97316',
  },
  {
    icon:        Target,
    titulo:      'Cobertura Programa Infantil',
    valor:       '91%',
    meta:        '90%',
    progreso:    91,
    barColor:    '#10b981',
    iconBg:      { light: '#ecfdf5', dark: 'rgba(16,185,129,0.15)' },
    iconColor:   '#10b981',
  },
  {
    icon:        TrendingUp,
    titulo:      'Cobertura Salud de la Mujer',
    valor:       '85%',
    meta:        '85%',
    progreso:    85,
    barColor:    '#ec4899',
    iconBg:      { light: '#fdf2f8', dark: 'rgba(236,72,153,0.15)' },
    iconColor:   '#ec4899',
  },
  {
    icon:        Award,
    titulo:      'Satisfacción Usuaria',
    valor:       '89%',
    meta:        '85%',
    progreso:    89,
    barColor:    '#3b82f6',
    iconBg:      { light: '#eff6ff', dark: 'rgba(59,130,246,0.15)' },
    iconColor:   '#3b82f6',
  },
]

const Transparencia = () => {
  const { dark } = useTheme()

  const C = {
    page:      dark ? '#0f172a' : '#ffffff',
    card:      dark ? '#1e293b' : '#ffffff',
    border:    dark ? '#334155' : '#e5e7eb',
    textP:     dark ? '#f1f5f9' : '#111827',
    textS:     dark ? '#94a3b8' : '#6b7280',
    textM:     dark ? '#64748b' : '#9ca3af',
    barTrack:  dark ? '#334155' : '#f3f4f6',
    periodoB:  dark ? 'rgba(59,130,246,0.12)' : '#eff6ff',
    periodoBr: dark ? '#1e40af'               : '#bfdbfe',
    periodoT:  dark ? '#93c5fd'               : '#1e3a5f',
    periodoS:  dark ? '#60a5fa'               : '#2563eb',
    shadow:    dark
      ? '0 1px 4px rgba(0,0,0,0.35)'
      : '0 1px 4px rgba(0,0,0,0.07)',
    cardHov:   dark ? '#273549' : '#f9fafb',
  }

  const card = (extra = {}) => ({
    background:   C.card,
    borderRadius: '16px',
    border:       `1px solid ${C.border}`,
    boxShadow:    C.shadow,
    transition:   'background 0.2s, border-color 0.2s',
    ...extra,
  })

  return (
    <main style={{ background: C.page, minHeight: '100vh', transition: 'background 0.2s' }}>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(to right, #1e3a5f, #2563eb)', padding: '56px 16px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ color: '#93c5fd', fontSize: '13px', marginBottom: '8px' }}>CESFAM Valle Mar</p>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,5vw,40px)', fontWeight: '800', margin: '0 0 8px' }}>
            Transparencia
          </h1>
          <p style={{ color: '#bfdbfe', maxWidth: '480px', margin: 0, lineHeight: 1.6 }}>
            Indicadores de gestión y cumplimiento de metas sanitarias.
            Información actualizada del Plan de Salud 2023–2025.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>

        {/* Período */}
        <div style={{
          background:   C.periodoB,
          border:       `1px solid ${C.periodoBr}`,
          borderRadius: '14px',
          padding:      '16px 20px',
          marginBottom: '32px',
          display:      'flex',
          alignItems:   'center',
          gap:          '14px',
        }}>
          <span style={{ fontSize: '24px' }}>📅</span>
          <div>
            <p style={{ margin: 0, fontWeight: '700', color: C.periodoT, fontSize: '15px' }}>
              Plan de Salud 2023 – 2025
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: C.periodoS }}>
              Datos actualizados al segundo semestre 2024 · Período de evaluación anual
            </p>
          </div>
        </div>

        {/* Indicadores */}
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: C.textP, margin: '0 0 20px' }}>
          Indicadores de Gestión
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '16px', marginBottom: '48px' }}>
          {INDICADORES.map(ind => {
            const Icon       = ind.icon
            const cumpleMeta = parseInt(ind.valor) >= parseInt(ind.meta)
            return (
              <div key={ind.titulo} style={card({ padding: '24px' })}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: dark ? ind.iconBg.dark : ind.iconBg.light,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={20} style={{ color: ind.iconColor }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: C.textP, lineHeight: 1.4, maxWidth: '180px' }}>
                      {ind.titulo}
                    </h3>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    background: cumpleMeta
                      ? (dark ? 'rgba(34,197,94,0.15)' : '#dcfce7')
                      : (dark ? 'rgba(245,158,11,0.15)' : '#fef3c7'),
                    color: cumpleMeta
                      ? (dark ? '#86efac' : '#166534')
                      : (dark ? '#fcd34d' : '#92400e'),
                    whiteSpace: 'nowrap',
                  }}>
                    {cumpleMeta ? '✓ Meta lograda' : '⏳ En proceso'}
                  </span>
                </div>

                {/* Valor */}
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '38px', fontWeight: '800', color: C.textP, lineHeight: 1 }}>
                    {ind.valor}
                  </span>
                  <span style={{ fontSize: '13px', color: C.textM, marginLeft: '8px' }}>
                    meta: {ind.meta}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div style={{ background: C.barTrack, borderRadius: '99px', height: '8px', marginBottom: '10px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    background: ind.barColor,
                    width: `${Math.min(ind.progreso, 100)}%`,
                    transition: 'width 0.7s ease',
                  }} />
                </div>

                <p style={{ margin: 0, fontSize: '12px', color: C.textS }}>{ind.descripcion}</p>
              </div>
            )
          })}
        </div>

        {/* Documentos */}
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: C.textP, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📄 Documentos Institucionales
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '12px' }}>
          {[
            { nombre: 'Plan de Salud 2023–2025',     tamaño: '2.4 MB' },
            { nombre: 'Presupuesto Anual 2024',       tamaño: '1.1 MB' },
            { nombre: 'Informe de Gestión Semestral', tamaño: '3.2 MB' },
          ].map(doc => (
            <div
              key={doc.nombre}
              style={card({ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' })}
              onMouseEnter={e => e.currentTarget.style.background = C.cardHov}
              onMouseLeave={e => e.currentTarget.style.background = C.card}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: dark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', color: '#ef4444',
              }}>
                PDF
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: C.textP, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.nombre}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.textM }}>{doc.tamaño}</p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', whiteSpace: 'nowrap' }}>
                ↓ Descargar
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Transparencia