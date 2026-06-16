import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    imagen_url: '',
    enlace: '',
    orden: 0,
    activo: true,
  });
  const [saving, setSaving] = useState(false);
  const { dark } = useTheme();

  const C = {
    card: dark ? '#1e293b' : '#ffffff',
    border: dark ? '#334155' : '#f1f5f9',
    textP: dark ? '#f1f5f9' : '#111827',
    textS: dark ? '#94a3b8' : '#6b7280',
    inputBg: dark ? '#0f172a' : '#ffffff',
    rowHov: dark ? '#273549' : '#fafafa',
    thBg: dark ? '#0f172a' : '#f8fafc',
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/banners');
      setBanners(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirModal = (banner = null) => {
    if (banner) {
      setForm({
        titulo: banner.titulo,
        descripcion: banner.descripcion || '',
        imagen_url: banner.imagen_url,
        enlace: banner.enlace || '',
        orden: banner.orden,
        activo: banner.activo,
      });
      setModal(banner);
    } else {
      setForm({
        titulo: '',
        descripcion: '',
        imagen_url: '',
        enlace: '',
        orden: 0,
        activo: true,
      });
      setModal({});
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.id) {
        await api.put(`/api/banners/${modal.id}`, form);
      } else {
        await api.post('/api/banners', form);
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
    if (!confirm('¿Eliminar este banner?')) return;
    try {
      await api.delete(`/api/banners/${id}`);
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: C.card,
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: C.textP }}>
              {modal.id ? 'Editar banner' : 'Nuevo banner'}
            </h3>
            <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                  Título *
                </label>
                <input
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  style={inp}
                  placeholder="Ej: Campaña Invierno"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  style={{ ...inp, resize: 'none' }}
                  placeholder="Texto secundario"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                  URL de la imagen *
                </label>
                <input
                  required
                  value={form.imagen_url}
                  onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                  style={inp}
                  placeholder="https://ejemplo.com/banner.jpg"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                  Enlace (opcional)
                </label>
                <input
                  value={form.enlace}
                  onChange={(e) => setForm({ ...form, enlace: e.target.value })}
                  style={inp}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                    Orden
                  </label>
                  <input
                    type="number"
                    value={form.orden}
                    onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                    style={inp}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: C.textS, display: 'block', marginBottom: '6px' }}>
                    Activo
                  </label>
                  <select
                    value={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}
                    style={inp}
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    border: `1.5px solid ${C.border}`,
                    borderRadius: '10px',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: C.textP,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '11px',
                    border: 'none',
                    borderRadius: '10px',
                    background: 'linear-gradient(to right, #1e3a5f, #2563eb)',
                    color: 'white',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: C.textP }}>Banners Informativos</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textS }}>Gestiona los banners que aparecen en la portada</p>
        </div>
        <button
          onClick={() => abrirModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            background: 'linear-gradient(to right, #1e3a5f, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          + Nuevo banner
        </button>
      </div>

      <div
        style={{
          background: C.card,
          borderRadius: '16px',
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
          boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.textS }}>Cargando…</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.textS }}>No hay banners. ¡Crea el primero!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: C.thBg, borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Imagen</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Título</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Orden</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: C.textS }}>Activo</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: C.textS }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.rowHov)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <img
                      src={b.imagen_url}
                      alt={b.titulo}
                      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </td>
                  <td style={{ fontWeight: '500', color: C.textP }}>{b.titulo}</td>
                  <td style={{ color: C.textS }}>{b.orden}</td>
                  <td style={{ color: C.textS }}>{b.activo ? '✅ Sí' : '❌ No'}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => abrirModal(b)}
                      style={{ padding: '6px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: C.textS }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => eliminar(b.id)}
                      style={{ padding: '6px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: C.textS }}
                    >
                      🗑️
                    </button>
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

export default AdminBanners;