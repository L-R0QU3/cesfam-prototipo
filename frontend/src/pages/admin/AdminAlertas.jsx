import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const AdminAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
    icono: '⚠️',
  });
  const [saving, setSaving] = useState(false);
  const { dark } = useTheme();

  const C = {
    card:    dark ? '#1e293b' : '#ffffff',
    border:  dark ? '#334155' : '#f1f5f9',
    textP:   dark ? '#f1f5f9' : '#111827',
    textS:   dark ? '#94a3b8' : '#6b7280',
    inputBg: dark ? '#0f172a' : '#ffffff',
    rowHov:  dark ? '#273549' : '#fafafa',
    thBg:    dark ? '#0f172a' : '#f8fafc',
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/alertas');
      setAlertas(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (alerta = null) => {
    if (alerta) {
      setForm({
        titulo: alerta.titulo,
        descripcion: alerta.descripcion,
        fecha_inicio: alerta.fecha_inicio?.slice(0, 16) || '',
        fecha_fin: alerta.fecha_fin?.slice(0, 16) || '',
        activo: alerta.activo,
        icono: alerta.icono || '⚠️',
      });
      setModal(alerta);
    } else {
      setForm({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        activo: true,
        icono: '⚠️',
      });
      setModal({});
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.id) {
        await api.put(`/api/alertas/${modal.id}`, form);
      } else {
        await api.post('/api/alertas', form);
      }
      setModal(null);
      cargar();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta alerta?')) return;
    try {
      await api.delete(`/api/alertas/${id}`);
      cargar();
    } catch {
      alert('Error al eliminar');
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
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: C.card, borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: C.textP }}>{modal.id ? 'Editar alerta' : 'Nueva alerta'}</h3>
            <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Título *</label>
                <input required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} style={inp} placeholder="Ej: Alerta Respiratoria" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Descripción *</label>
                <textarea required rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} style={{ ...inp, resize: 'none' }} placeholder="Detalles de la alerta..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Fecha inicio (opcional)</label>
                  <input type="datetime-local" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Fecha fin (opcional)</label>
                  <input type="datetime-local" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} style={inp} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Ícono / Emoji</label>
                <select value={form.icono} onChange={e => setForm({ ...form, icono: e.target.value })} style={inp}>
                  <option value="⚠️">⚠️ Alerta</option>
                  <option value="🚨">🚨 Urgente</option>
                  <option value="🦠">🦠 Virus / Enfermedad</option>
                  <option value="💉">💉 Vacunación</option>
                  <option value="🏥">🏥 Hospital</option>
                  <option value="📢">📢 Aviso</option>
                  <option value="🌡️">🌡️ Fiebre</option>
                  <option value="🧪">🧪 Laboratorio</option>
                  <option value="🗓️">🗓️ Fecha importante</option>
                  <option value="❄️">❄️ Invierno</option>
                  <option value="☀️">☀️ Verano</option>
                  <option value="🐶">🐶 Zoonosis</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Activa</label>
                <select value={form.activo} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })} style={inp}>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setModal(null)} style={{ flex: 1, padding: '11px', border: `1.5px solid ${C.border}`, borderRadius: '10px', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: C.textP }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}>{saving ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div><h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: C.textP }}>Alertas Epidemiológicas</h1><p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textS }}>Gestiona las alertas que aparecen en la portada</p></div>
        <button onClick={() => abrirModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>+ Nueva alerta</button>
      </div>

      <div style={{ background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)' }}>
        {loading ? (<div style={{ padding: '48px', textAlign: 'center', color: C.textS }}>Cargando…</div>) : alertas.length === 0 ? (<div style={{ padding: '48px', textAlign: 'center', color: C.textS }}>No hay alertas. ¡Crea la primera!</div>) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: C.thBg, borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Ícono</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Título</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Activa</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: C.textS }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map(a => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }} onMouseEnter={e => e.currentTarget.style.background = C.rowHov} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontSize: '18px', textAlign: 'center' }}>{a.icono || '⚠️'}</td>
                  <td style={{ fontWeight: '500', color: C.textP }}>{a.titulo}</td>
                  <td style={{ color: C.textS }}>{a.activo ? '✅ Sí' : '❌ No'}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button onClick={() => abrirModal(a)} style={{ padding: '6px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: C.textS }}>✏️</button>
                    <button onClick={() => eliminar(a.id)} style={{ padding: '6px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: C.textS }}>🗑️</button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAlertas;