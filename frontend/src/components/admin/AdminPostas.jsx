import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const TIPO_CFG = {
  posta:    { emoji: '🏥', label: 'Posta Rural',           bg: '#eff6ff' },
  estacion: { emoji: '🏕️', label: 'Estación Médica Rural', bg: '#f0fdf4' },
};

const AdminPostas = () => {
  const [postas,  setPostas]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);  // editar horario
  const [horario, setHorario] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [modalNueva, setModalNueva] = useState(false);
  const [form,    setForm]    = useState({ nombre: '', tipo: 'posta', ubicacion: '', horario_atencion: '', encargado: '', telefono: '' });
  const [creando, setCreando] = useState(false);
  const { dark } = useTheme();

  // Colores según modo oscuro
  const C = {
    card:    dark ? '#1e293b' : '#ffffff',
    border:  dark ? '#334155' : '#f1f5f9',
    textP:   dark ? '#f1f5f9' : '#111827',
    textS:   dark ? '#94a3b8' : '#6b7280',
    inputBg: dark ? '#0f172a' : '#ffffff',
    hover:   dark ? '#273549' : '#f9fafb',
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/postas');
      setPostas(r.data.data ?? []);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (p) => { setModal(p); setHorario(p.horario_atencion ?? ''); };

  const guardarHorario = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/postas/${modal.id}/horario`, { horario_atencion: horario });
      setModal(null);
      cargar();
    } catch {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/api/postas/${id}`);
      setPostas(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  const crearPosta = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await api.post('/api/postas', form);
      setModalNueva(false);
      setForm({ nombre: '', tipo: 'posta', ubicacion: '', horario_atencion: '', encargado: '', telefono: '' });
      cargar();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al crear');
    } finally {
      setCreando(false);
    }
  };

  const inp = {
    width: '100%',
    boxSizing: 'border-box',
    border: `1.5px solid ${C.border}`,
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    background: C.inputBg,
    color: C.textP,
  };

  return (
    <AdminLayout>
      {/* Modal editar horario */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: C.card, borderRadius: '20px', width: '100%', maxWidth: '420px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: C.textP }}>
              Editar horario
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: C.textS }}>
              {modal.nombre}
            </p>
            <textarea
              rows={3}
              value={horario}
              onChange={e => setHorario(e.target.value)}
              placeholder="Ej: Lunes y Miércoles 09:00 - 12:00"
              style={{ ...inp, resize: 'none', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setModal(null)}
                style={{
                  flex: 1, padding: '11px', border: `1.5px solid ${C.border}`,
                  borderRadius: '10px', background: C.card, cursor: 'pointer',
                  fontSize: '14px', fontWeight: '500', color: C.textP
                }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarHorario}
                disabled={saving}
                style={{
                  flex: 1, padding: '11px', border: 'none', borderRadius: '10px',
                  background: 'linear-gradient(to right,#1e3a5f,#2563eb)',
                  color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600'
                }}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva posta */}
      {modalNueva && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: C.card, borderRadius: '20px', width: '100%', maxWidth: '480px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: C.textP }}>
              Nueva Posta / Estación
            </h3>
            <form onSubmit={crearPosta} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                  Nombre *
                </label>
                <input
                  required
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Posta Pupuya"
                  style={inp}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                    Tipo *
                  </label>
                  <select
                    value={form.tipo}
                    onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                    style={inp}
                  >
                    <option value="posta">Posta Rural</option>
                    <option value="estacion">Estación Médica Rural</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                    Ubicación *
                  </label>
                  <input
                    required
                    value={form.ubicacion}
                    onChange={e => setForm(p => ({ ...p, ubicacion: e.target.value }))}
                    placeholder="Ej: Pupuya, Navidad"
                    style={inp}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                  Horario de atención
                </label>
                <input
                  value={form.horario_atencion}
                  onChange={e => setForm(p => ({ ...p, horario_atencion: e.target.value }))}
                  placeholder="Ej: Lunes y Miércoles 09:00 - 12:00"
                  style={inp}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                    Encargado
                  </label>
                  <input
                    value={form.encargado}
                    onChange={e => setForm(p => ({ ...p, encargado: e.target.value }))}
                    placeholder="Ej: EU Juan Pérez"
                    style={inp}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                    Teléfono
                  </label>
                  <input
                    value={form.telefono}
                    onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                    placeholder="+56 72 241 2345"
                    style={inp}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setModalNueva(false)}
                  style={{
                    flex: 1, padding: '11px', border: `1.5px solid ${C.border}`,
                    borderRadius: '10px', background: C.card, cursor: 'pointer',
                    fontSize: '14px', fontWeight: '500', color: C.textP
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creando}
                  style={{
                    flex: 1, padding: '11px', border: 'none', borderRadius: '10px',
                    background: 'linear-gradient(to right,#1e3a5f,#2563eb)',
                    color: 'white', cursor: creando ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: '600'
                  }}
                >
                  {creando ? 'Creando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: C.textP }}>
            Postas Rurales
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textS }}>
            {postas.length} unidades registradas
          </p>
        </div>
        <button
          onClick={() => setModalNueva(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
            background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white',
            border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}
        >
          + Nueva posta
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: C.textS }}>Cargando…</div>
      ) : postas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: C.textS }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏥</div>
          No hay postas registradas.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
          {postas.map(p => {
            const cfg = TIPO_CFG[p.tipo] ?? TIPO_CFG.posta;
            return (
              <div key={p.id} style={{
                background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`,
                padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', background: cfg.bg, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0
                  }}>
                    {cfg.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: C.textP }}>
                      {p.nombre}
                    </div>
                    <div style={{ fontSize: '11px', color: C.textS }}>{cfg.label}</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: C.textS, display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                  <span>📍 {p.ubicacion}</span>
                  <span>🕐 {p.horario_atencion ?? 'Sin horario definido'}</span>
                  {p.encargado && <span>👤 {p.encargado}</span>}
                  {p.telefono && <span>📞 {p.telefono}</span>}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => abrirModal(p)}
                    style={{
                      flex: 1, padding: '8px', border: `1.5px solid ${C.border}`,
                      borderRadius: '8px', background: C.card, cursor: 'pointer',
                      fontSize: '12px', fontWeight: '500', color: C.textP,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = C.hover}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = C.card}
                  >
                    ✏️ Editar horario
                  </button>
                  <button
                    onClick={() => eliminar(p.id, p.nombre)}
                    style={{
                      padding: '8px 12px', border: `1.5px solid ${C.border}`,
                      borderRadius: '8px', background: C.card, cursor: 'pointer',
                      fontSize: '12px', fontWeight: '500', color: '#dc2626'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = C.card}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPostas;