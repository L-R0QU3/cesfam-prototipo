import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const DIAS_LABEL = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes' };

const AdminHorarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', tipo: 'box' });
  const [saving, setSaving] = useState(false);
  const { dark } = useTheme();

  const C = {
    card:    dark ? '#1e293b' : '#ffffff',
    page:    dark ? '#0f172a' : '#f8fafc',
    border:  dark ? '#334155' : '#f1f5f9',
    textP:   dark ? '#f1f5f9' : '#111827',
    textS:   dark ? '#94a3b8' : '#6b7280',
    inputBg: dark ? '#0f172a' : '#ffffff',
    iconBg:  dark ? 'rgba(59,130,246,0.2)' : '#eff6ff',
    btnSavedBg: dark ? 'rgba(34,197,94,0.2)' : '#dcfce7',
    btnSavedColor: dark ? '#86efac' : '#166534',
  };
  const inp = { width: '100%', boxSizing: 'border-box', border: `1.5px solid ${C.border}`, borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none', background: C.inputBg, color: C.textP, transition: 'border-color 0.2s' };

  const cargar = async () => {
    setLoading(true);
    try { const r = await api.get('/api/horarios'); setHorarios(r.data.data ?? []); } catch { /* silencioso */ } finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const update = (id, dia, val) => setHorarios(prev => prev.map(h => h.id === id ? { ...h, [dia]: val } : h));
  const guardar = async (h) => {
    try { await api.put(`/api/horarios/${h.id}`, h); setSaved(h.id); setTimeout(() => setSaved(null), 2500); } catch { alert('Error al guardar'); }
  };
  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try { await api.delete(`/api/horarios/${id}`); setHorarios(p => p.filter(h => h.id !== id)); } catch { alert('Error al eliminar'); }
  };
  const crearHorario = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/api/horarios', form); setModal(false); setForm({ nombre: '', tipo: 'box' }); cargar(); } catch (err) { alert(err.response?.data?.message ?? 'Error al crear'); } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: C.card, borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: C.textP }}>Nuevo Horario</h3>
            <form onSubmit={crearHorario} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Nombre *</label><input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Box 1 - Medicina General" style={{ ...inp, padding: '10px 14px', fontSize: '14px', borderRadius: '10px' }} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Tipo</label><select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} style={{ ...inp, padding: '10px 14px', fontSize: '14px', borderRadius: '10px' }}><option value="box">Box</option><option value="laboratorio">Laboratorio</option><option value="otro">Otro</option></select></div>
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '11px', border: `1.5px solid ${C.border}`, borderRadius: '10px', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: C.textP }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}>{saving ? 'Creando…' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div><h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: C.textP }}>Horarios de Atención</h1><p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textS }}>{horarios.length} horarios registrados</p></div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>+ Nuevo horario</button>
      </div>

      {loading ? (<div style={{ textAlign: 'center', padding: '48px', color: C.textS }}>Cargando…</div>) : horarios.length === 0 ? (<div style={{ textAlign: 'center', padding: '48px', color: C.textS }}><div style={{ fontSize: '40px', marginBottom: '12px' }}>🕐</div>No hay horarios registrados.</div>) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {horarios.map(h => (
            <div key={h.id} style={{ background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, padding: '20px', boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', background: C.iconBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{h.tipo === 'laboratorio' ? '🔬' : '🏥'}</div>
                  <div><div style={{ fontSize: '14px', fontWeight: '600', color: C.textP }}>{h.nombre}</div><div style={{ fontSize: '11px', color: C.textS, textTransform: 'capitalize' }}>{h.tipo}</div></div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => guardar(h)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: saved === h.id ? C.btnSavedBg : '#2563eb', color: saved === h.id ? C.btnSavedColor : 'white', transition: 'all 0.2s' }}>{saved === h.id ? '✓ Guardado' : '💾 Guardar'}</button>
                  <button onClick={() => eliminar(h.id, h.nombre)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', border: `1.5px solid ${dark ? '#7f1d1d' : '#fee2e2'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: 'transparent', color: '#dc2626', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>🗑️ Eliminar</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px' }}>
                {DIAS.map(dia => (
                  <div key={dia}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: C.textS, marginBottom: '4px' }}>{DIAS_LABEL[dia]}</label>
                    <input value={h[dia] ?? ''} onChange={e => update(h.id, dia, e.target.value)} placeholder="—" style={inp} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = C.border} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminHorarios;