import { useState, useEffect } from 'react'
import AdminLayout             from '../../components/admin/AdminLayout'
import { useTheme }            from '../../context/ThemeContext'
import api                     from '../../utils/api'

const CATEGORIAS = [
  { value: 'infantil',       label: '👶 Infantil',       bg: '#d1fae5', color: '#065f46' },
  { value: 'mujer',          label: '🌸 Mujer',          bg: '#fce7f3', color: '#9d174d' },
  { value: 'cardiovascular', label: '❤️ Cardiovascular', bg: '#fee2e2', color: '#991b1b' },
  { value: 'salud_mental',   label: '🧠 Salud Mental',   bg: '#ede9fe', color: '#5b21b6' },
]

const getCat = v => CATEGORIAS.find(c => c.value === v) ?? CATEGORIAS[0]

/* ── Modal Crear / Editar ──────────────────────────────── */
const ModalPrograma = ({ programa, onClose, onGuardar, dark }) => {
  const [form, setForm] = useState({
    nombre:           programa?.nombre           ?? '',
    categoria:        programa?.categoria        ?? 'infantil',
    descripcion:      programa?.descripcion      ?? '',
    objetivo:         programa?.objetivo         ?? '',
    beneficiarios:    programa?.beneficiarios    ?? '',
    horario_atencion: programa?.horario_atencion ?? '',
    activo:           programa?.activo           ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const cardBg = dark ? '#1e293b' : '#ffffff'
  const textP  = dark ? '#f1f5f9' : '#111827'
  const textS  = dark ? '#94a3b8' : '#6b7280'
  const border = dark ? '#334155' : '#e5e7eb'
  const inp    = { width: '100%', boxSizing: 'border-box', border: `1.5px solid ${border}`, borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: dark ? '#0f172a' : '#ffffff', color: textP }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      programa?.id
        ? await api.put(`/api/programas/${programa.id}`, form)
        : await api.post('/api/programas', form)
      onGuardar()
    } catch (err) { setError(err.response?.data?.message ?? 'Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: cardBg, borderRadius: '20px', width: '100%', maxWidth: '560px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header modal */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${dark ? '#334155' : '#f1f5f9'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: textP }}>
            {programa?.id ? 'Editar programa' : 'Nuevo programa'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: textS, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <form onSubmit={submit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}>{error}</div>
          )}

          {/* Nombre */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: textS, display: 'block', marginBottom: '6px' }}>Nombre del programa *</label>
            <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej: Programa de Salud Infantil" style={inp} />
          </div>

          {/* Categoría */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: textS, display: 'block', marginBottom: '8px' }}>Categoría *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CATEGORIAS.map(c => (
                <button key={c.value} type="button" onClick={() => setForm(p => ({ ...p, categoria: c.value }))}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: `2px solid ${form.categoria === c.value ? c.color : border}`, background: form.categoria === c.value ? c.bg : 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: form.categoria === c.value ? c.color : textS, transition: 'all 0.15s', textAlign: 'left' }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: textS, display: 'block', marginBottom: '6px' }}>Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción del programa..." style={{ ...inp, resize: 'none' }} />
          </div>

          {/* Objetivo */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: textS, display: 'block', marginBottom: '6px' }}>Objetivo</label>
            <input value={form.objetivo} onChange={e => setForm(p => ({ ...p, objetivo: e.target.value }))}
              placeholder="Objetivo principal del programa" style={inp} />
          </div>

          {/* 2 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: textS, display: 'block', marginBottom: '6px' }}>Beneficiarios</label>
              <input value={form.beneficiarios} onChange={e => setForm(p => ({ ...p, beneficiarios: e.target.value }))}
                placeholder="Ej: Niños de 0 a 15 años" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: textS, display: 'block', marginBottom: '6px' }}>Horario de atención</label>
              <input value={form.horario_atencion} onChange={e => setForm(p => ({ ...p, horario_atencion: e.target.value }))}
                placeholder="Ej: Lunes 08:00 - 13:00" style={inp} />
            </div>
          </div>

          {/* Activo toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" onClick={() => setForm(p => ({ ...p, activo: !p.activo }))}
              style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', background: form.activo ? '#2563eb' : (dark ? '#475569' : '#d1d5db'), transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '3px', left: form.activo ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: '500', color: textP }}>{form.activo ? 'Programa activo' : 'Programa inactivo'}</span>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '12px', border: `1.5px solid ${border}`, borderRadius: '10px', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: textP }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Guardando…' : (programa?.id ? 'Actualizar' : 'Crear programa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Página principal ──────────────────────────────────── */
const AdminProgramas = () => {
  const [programas, setProgramas] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [filtro,    setFiltro]    = useState('todos')
  const { dark } = useTheme()

  const cardBg  = dark ? '#1e293b' : '#ffffff'
  const pageBg  = dark ? '#0f172a' : '#f8fafc'
  const border  = dark ? '#334155' : '#f1f5f9'
  const textP   = dark ? '#f1f5f9' : '#111827'
  const textS   = dark ? '#94a3b8' : '#6b7280'

  const cargar = async () => {
    setLoading(true)
    try { const r = await api.get('/api/programas'); setProgramas(r.data.data ?? []) }
    catch { /* silencioso */ } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
    try { await api.delete(`/api/programas/${id}`); setProgramas(p => p.filter(x => x.id !== id)) }
    catch { alert('Error al eliminar') }
  }

  const toggleActivo = async (programa) => {
    try {
      await api.put(`/api/programas/${programa.id}`, { activo: !programa.activo })
      setProgramas(p => p.map(x => x.id === programa.id ? { ...x, activo: !x.activo } : x))
    } catch { alert('Error al actualizar') }
  }

  const filtrados = filtro === 'todos'
    ? programas
    : programas.filter(p => p.categoria === filtro)

  return (
    <AdminLayout>
      {modal !== null && (
        <ModalPrograma
          programa={modal}
          dark={dark}
          onClose={() => setModal(null)}
          onGuardar={() => { setModal(null); cargar() }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: textP }}>Programas de Salud</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: textS }}>{programas.length} programas en total</p>
        </div>
        <button onClick={() => setModal({})}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          + Nuevo programa
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[{ value: 'todos', label: 'Todos' }, ...CATEGORIAS.map(c => ({ value: c.value, label: c.label }))].map(f => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            style={{ padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${filtro === f.value ? '#2563eb' : border}`, background: filtro === f.value ? '#2563eb' : 'transparent', color: filtro === f.value ? 'white' : textS, cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.15s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de programas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: textS }}>Cargando…</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: textS }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>❤️</div>
          No hay programas en esta categoría.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {filtrados.map(p => {
            const cat = getCat(p.categoria)
            return (
              <div key={p.id} style={{ background: cardBg, borderRadius: '16px', border: `1px solid ${border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s', opacity: p.activo ? 1 : 0.65 }}>

                {/* Top colorido */}
                <div style={{ height: '6px', background: `linear-gradient(to right, ${cat.color}, ${cat.bg})` }} />

                <div style={{ padding: '16px' }}>
                  {/* Badge + activo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: cat.bg, color: cat.color }}>
                      {cat.label}
                    </span>
                    <button onClick={() => toggleActivo(p)} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', border: 'none', cursor: 'pointer', background: p.activo ? '#dcfce7' : (dark ? '#374151' : '#f3f4f6'), color: p.activo ? '#166534' : textS, transition: 'all 0.15s' }}>
                      {p.activo ? '✓ Activo' : '○ Inactivo'}
                    </button>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: textP, lineHeight: 1.3 }}>{p.nombre}</h3>

                  {p.descripcion && (
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: textS, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.descripcion}
                    </p>
                  )}

                  {p.beneficiarios && (
                    <div style={{ fontSize: '11px', color: textS, marginBottom: '4px' }}>👥 {p.beneficiarios}</div>
                  )}
                  {p.horario_atencion && (
                    <div style={{ fontSize: '11px', color: textS, marginBottom: '12px' }}>🕐 {p.horario_atencion}</div>
                  )}

                  {/* Botones */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${border}`, paddingTop: '12px' }}>
                    <button onClick={() => setModal(p)}
                      style={{ flex: 1, padding: '8px', border: `1.5px solid ${border}`, borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: textP, transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                      ✏️ Editar
                    </button>
                    <button onClick={() => eliminar(p.id, p.nombre)}
                      style={{ padding: '8px 12px', border: '1.5px solid #fee2e2', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#dc2626', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminProgramas