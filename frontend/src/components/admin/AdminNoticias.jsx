import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const ESTADOS = {
  publicada: { label: 'Publicada', bg: '#dcfce7', color: '#166534', bgDark: '#14532d', colorDark: '#86efac' },
  borrador:  { label: 'Borrador',  bg: '#fef3c7', color: '#92400e', bgDark: '#451a03', colorDark: '#fcd34d' },
  archivada: { label: 'Archivada', bg: '#f3f4f6', color: '#4b5563', bgDark: '#1f2937', colorDark: '#9ca3af' },
};

const Modal = ({ noticia, onClose, onGuardar, dark }) => {
  const [form, setForm] = useState({
    titulo: noticia?.titulo ?? '',
    contenido: noticia?.contenido ?? '',
    estado: noticia?.estado ?? 'borrador',
    categoria: noticia?.categoria ?? '',
    imagen_url: noticia?.imagen_url ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const C = {
    card:    dark ? '#1e293b' : '#ffffff',
    textP:   dark ? '#f1f5f9' : '#111827',
    textS:   dark ? '#94a3b8' : '#6b7280',
    border:  dark ? '#334155' : '#e5e7eb',
    inputBg: dark ? '#0f172a' : '#ffffff',
    errorBg: dark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
    errorBorder: dark ? '#7f1d1d' : '#fecaca',
    errorColor: dark ? '#f87171' : '#dc2626',
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

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (noticia?.id) {
        await api.put(`/api/noticias/${noticia.id}`, form);
      } else {
        await api.post('/api/noticias', form);
      }
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: C.card, borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: C.textP }}>{noticia?.id ? 'Editar noticia' : 'Nueva noticia'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: C.textS }}>×</button>
        </div>
        <form onSubmit={submit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, color: C.errorColor, padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Título *</label>
            <input required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} style={inp} placeholder="Título de la noticia" />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Contenido *</label>
            <textarea required rows={4} value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} style={{ ...inp, resize: 'none' }} placeholder="Contenido..." />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>URL de imagen (opcional)</label>
            <input value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })} style={inp} placeholder="https://ejemplo.com/imagen.jpg" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Estado</label>
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} style={inp}>
                <option value="borrador">Borrador</option>
                <option value="publicada">Publicada</option>
                <option value="archivada">Archivada</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>Categoría</label>
              <input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={inp} placeholder="Ej: Cardiovascular" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: `1.5px solid ${C.border}`, borderRadius: '10px', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: C.textP }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminNoticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [buscar, setBuscar] = useState('');
  const { dark } = useTheme();

  const C = {
    card:    dark ? '#1e293b' : '#ffffff',
    border:  dark ? '#334155' : '#f1f5f9',
    textP:   dark ? '#f1f5f9' : '#111827',
    textS:   dark ? '#94a3b8' : '#6b7280',
    inputBg: dark ? '#0f172a' : '#ffffff',
    rowHov:  dark ? '#273549' : '#fafafa',
    thBg:    dark ? '#0f172a' : '#f8fafc',
    btnIconColor: dark ? '#94a3b8' : '#6b7280',
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/noticias?limit=50');
      setNoticias(r.data.data ?? []);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    try {
      await api.delete(`/api/noticias/${id}`);
      cargar();
    } catch {
      alert('Error al eliminar');
    }
  };

  const filtradas = noticias.filter(n => n.titulo?.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <AdminLayout>
      {modal !== null && <Modal noticia={modal} dark={dark} onClose={() => setModal(null)} onGuardar={() => { setModal(null); cargar(); }} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: C.textP }}>Noticias</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textS }}>Gestiona el contenido del sitio</p>
        </div>
        <button onClick={() => setModal({})} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          + Nueva noticia
        </button>
      </div>

      <input
        value={buscar}
        onChange={e => setBuscar(e.target.value)}
        placeholder="🔍 Buscar noticia..."
        style={{
          padding: '10px 14px',
          border: `1.5px solid ${C.border}`,
          borderRadius: '10px',
          fontSize: '13px',
          outline: 'none',
          marginBottom: '16px',
          width: '280px',
          display: 'block',
          background: C.inputBg,
          color: C.textP,
        }}
      />

      <div style={{ background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.textS }}>Cargando…</div>
        ) : filtradas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.textS }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📰</div>
            No hay noticias. ¡Crea la primera!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: C.thBg, borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Imagen</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Título</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Estado</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Fecha</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: C.textS }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((n, i) => {
                const est = ESTADOS[n.estado];
                return (
                  <tr
                    key={n.id}
                    style={{
                      borderBottom: i < filtradas.length - 1 ? `1px solid ${C.border}` : 'none',
                      background: C.card,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.rowHov}
                    onMouseLeave={e => e.currentTarget.style.background = C.card}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      {n.imagen_url ? (
                        <img src={n.imagen_url} alt={n.titulo} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : '—'}
                    </td>
                    <td style={{ fontWeight: '500', color: C.textP, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.titulo}</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: dark ? est?.bgDark : est?.bg, color: dark ? est?.colorDark : est?.color }}>
                        {est?.label ?? n.estado}
                      </span>
                    </td>
                    <td style={{ color: C.textS }}>{n.created_at ? new Date(n.created_at).toLocaleDateString('es-CL') : '—'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button onClick={() => setModal(n)} style={{ padding: '6px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: C.btnIconColor }}>✏️</button>
                      <button onClick={() => eliminar(n.id)} style={{ padding: '6px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: C.btnIconColor }}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNoticias;