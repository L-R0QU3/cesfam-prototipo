import { useEffect, useState, useCallback } from 'react'
import { RefreshCw }                        from 'lucide-react'
import AdminLayout                          from '../../components/admin/AdminLayout'
import { useTheme }                         from '../../context/ThemeContext'
import api                                  from '../../utils/api'

/* ── Helpers ─────────────────────────────────────────────── */
const fmtNum = n => (n ?? 0).toLocaleString('es-CL')

const signo  = n => n > 0 ? `+${n}%` : n < 0 ? `${n}%` : '0%'

const MES_ES = {
  Jan:'Ene', Feb:'Feb', Mar:'Mar', Apr:'Abr', May:'May', Jun:'Jun',
  Jul:'Jul', Aug:'Ago', Sep:'Sep', Oct:'Oct', Nov:'Nov', Dec:'Dic',
}

/* ── Componente ─────────────────────────────────────────── */
const AdminAnaliticas = () => {
  const { dark } = useTheme()

  const [kpis,    setKpis]    = useState(null)
  const [meses,   setMeses]   = useState([])
  const [paginas, setPaginas] = useState([])
  const [hoy,     setHoy]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [lastUpd, setLastUpd] = useState(null)

  const C = {
    page:    dark ? '#0f172a' : '#f1f5f9',
    card:    dark ? '#1e293b' : '#ffffff',
    border:  dark ? '#334155' : '#e2e8f0',
    textP:   dark ? '#f1f5f9' : '#0f172a',
    textS:   dark ? '#94a3b8' : '#64748b',
    textM:   dark ? '#64748b' : '#94a3b8',
    itemBg:  dark ? '#0f172a' : '#f8fafc',
    barBg:   dark ? '#1e3a5f' : '#dbeafe',
    shadow:  dark
      ? '0 1px 3px rgba(0,0,0,0.4)'
      : '0 1px 3px rgba(0,0,0,0.08)',
  }

  const card = (extra = {}) => ({
    background:   C.card,
    borderRadius: '16px',
    border:       `1px solid ${C.border}`,
    boxShadow:    C.shadow,
    transition:   'background 0.2s',
    ...extra,
  })

  /* ── Carga de datos ───────────────────────────────────── */
  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [resKpis, resMeses, resPaginas, resHoy] = await Promise.all([
        api.get('/api/analytics/kpis'),
        api.get('/api/analytics/por-mes'),
        api.get('/api/analytics/paginas'),
        api.get('/api/analytics/hoy'),
      ])

      setKpis(resKpis.data.data)
      setMeses(resMeses.data.data ?? [])
      setPaginas(resPaginas.data.data ?? [])
      setHoy(resHoy.data.data ?? [])
      setLastUpd(new Date())
    } catch (err) {
      setError('No se pudieron cargar las analíticas.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
    // Refrescar cada 2 minutos
    const interval = setInterval(cargarDatos, 120_000)
    return () => clearInterval(interval)
  }, [cargarDatos])

  /* ── KPI Cards ────────────────────────────────────────── */
  const KPIS_CONFIG = [
    {
      emoji: '👁️',
      label: 'Visitas este mes',
      valor: kpis ? fmtNum(kpis.visitas_mes)     : '…',
      sub:   kpis ? `${signo(kpis.variacion_pct)} vs mes anterior` : 'Cargando…',
      bg:    dark ? 'rgba(59,130,246,0.15)'  : '#eff6ff',
      subColor: kpis
        ? kpis.variacion_pct >= 0
          ? (dark ? '#86efac' : '#166534')
          : (dark ? '#fca5a5' : '#dc2626')
        : C.textM,
    },
    {
      emoji: '📅',
      label: 'Visitas hoy',
      valor: kpis ? fmtNum(kpis.visitas_hoy)     : '…',
      sub:   'En tiempo real',
      bg:    dark ? 'rgba(16,185,129,0.15)' : '#f0fdfa',
      subColor: C.textM,
    },
    {
      emoji: '🔗',
      label: 'Sesiones únicas',
      valor: kpis ? fmtNum(kpis.sesiones_unicas) : '…',
      sub:   'Este mes',
      bg:    dark ? 'rgba(139,92,246,0.15)' : '#f5f3ff',
      subColor: C.textM,
    },
    {
      emoji: '📈',
      label: 'Variación mensual',
      valor: kpis ? signo(kpis.variacion_pct)    : '…',
      sub:   'Respecto al mes anterior',
      bg:    dark ? 'rgba(245,158,11,0.15)'  : '#fffbeb',
      subColor: C.textM,
    },
  ]

  /* ── Gráfico de barras mensual ────────────────────────── */
  const maxMes = Math.max(...meses.map(m => parseInt(m.total)), 1)

  /* ── Gráfico de barras por hora (hoy) ────────────────── */
  const HORAS = Array.from({ length: 24 }, (_, i) => i)
  const visitasPorHora = HORAS.map(h => {
    const found = hoy.find(r => parseInt(r.hora) === h)
    return { hora: h, total: found ? parseInt(found.total) : 0 }
  })
  const maxHora = Math.max(...visitasPorHora.map(h => h.total), 1)

  /* ── Render ───────────────────────────────────────────── */
  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: C.textP }}>
            Analíticas
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textS }}>
            Estadísticas reales de visitas · {lastUpd
              ? `Actualizado ${lastUpd.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
              : 'Cargando…'
            }
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '10px',
            border: `1px solid ${C.border}`, background: C.card,
            color: C.textS, cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: '500',
            transition: 'all 0.15s',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: dark ? 'rgba(239,68,68,0.12)' : '#fef2f2',
          border: `1px solid ${dark ? '#7f1d1d' : '#fecaca'}`,
          borderRadius: '12px', padding: '16px 20px',
          marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span>⚠️</span>
          <p style={{ margin: 0, fontSize: '13px', color: dark ? '#fca5a5' : '#dc2626' }}>{error}</p>
          <button onClick={cargarDatos} style={{ marginLeft: 'auto', fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── KPIs ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '14px', marginBottom: '20px' }}>
        {KPIS_CONFIG.map(k => (
          <div key={k.label} style={card({ padding: '20px' })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textS }}>{k.label}</p>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: C.textP, lineHeight: 1 }}>{k.valor}</p>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: k.subColor }}>{k.sub}</p>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {k.emoji}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráfico mensual + Páginas populares ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Visitas por mes */}
        <div style={card({ padding: '20px' })}>
          <h2 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '700', color: C.textP }}>
            📅 Visitas por mes (últimos 6 meses)
          </h2>
          {meses.length === 0 ? (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textM, fontSize: '13px' }}>
              {loading ? 'Cargando…' : 'Sin datos aún. Las visitas se registran automáticamente.'}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '140px' }}>
              {meses.map(m => {
                const pct  = Math.round((parseInt(m.total) / maxMes) * 100)
                const mesLabel = MES_ES[m.mes] ?? m.mes
                return (
                  <div key={m.fecha} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '10px', color: C.textS, fontWeight: '600' }}>{parseInt(m.total).toLocaleString()}</span>
                    <div
                      title={`${mesLabel}: ${m.total} visitas`}
                      style={{ width: '100%', background: '#3b82f6', borderRadius: '6px 6px 0 0', height: `${pct}%`, minHeight: '4px', transition: 'height 0.5s', opacity: dark ? 0.85 : 1, cursor: 'default' }}
                    />
                    <span style={{ fontSize: '11px', color: C.textS, fontWeight: '500' }}>{mesLabel}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Páginas más visitadas */}
        <div style={card({ padding: '20px' })}>
          <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: C.textP }}>
            🔥 Páginas más visitadas (este mes)
          </h2>
          {paginas.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: C.textM, fontSize: '13px' }}>
              {loading ? 'Cargando…' : 'Sin datos aún.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paginas.map(p => (
                <div key={p.pagina}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: C.textP, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                      {p.pagina}
                    </span>
                    <span style={{ fontSize: '12px', color: C.textS, flexShrink: 0 }}>
                      {fmtNum(p.visitas)} ({p.pct}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', background: dark ? '#1e293b' : '#f1f5f9', borderRadius: '3px', border: `1px solid ${C.border}` }}>
                    <div style={{ height: '100%', background: '#3b82f6', borderRadius: '3px', width: `${p.pct}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Visitas de hoy por hora ───────────────────────── */}
      <div style={card({ padding: '20px' })}>
        <h2 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '700', color: C.textP }}>
          🕐 Visitas de hoy por hora
        </h2>
        {visitasPorHora.every(h => h.total === 0) ? (
          <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textM, fontSize: '13px' }}>
            {loading ? 'Cargando…' : 'Aún no hay visitas hoy. Navega por el sitio para generar datos.'}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px', marginBottom: '6px' }}>
              {visitasPorHora.map(({ hora, total }) => {
                const pct = Math.round((total / maxHora) * 100)
                return (
                  <div
                    key={hora}
                    title={`${hora}:00 — ${total} visitas`}
                    style={{
                      flex: 1,
                      height: `${Math.max(pct, total > 0 ? 8 : 0)}%`,
                      minHeight: total > 0 ? '4px' : '0',
                      background: total > 0
                        ? '#3b82f6'
                        : (dark ? '#1e293b' : '#f1f5f9'),
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.4s',
                      cursor: total > 0 ? 'default' : 'default',
                      opacity: dark && total > 0 ? 0.85 : 1,
                    }}
                  />
                )
              })}
            </div>
            {/* Etiquetas de hora */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {visitasPorHora.map(({ hora }) => (
                hora % 4 === 0 ? (
                  <div key={hora} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: C.textM }}>
                    {hora}h
                  </div>
                ) : (
                  <div key={hora} style={{ flex: 1 }} />
                )
              ))}
            </div>
          </div>
        )}
      </div>

    </AdminLayout>
  )
}

export default AdminAnaliticas