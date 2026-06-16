import { useState, useEffect } from 'react';
import { Upload, RefreshCw, Search, FileText } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const formatRut = (val) => {
  const clean = val.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};

/* ── Modal subir examen ───────────────────────────────── */
const ModalSubir = ({ tipos, onClose, onExito, dark, C }) => {
  const [form, setForm] = useState({
    rut_paciente: '',
    nombre_paciente: '',
    email: '',
    telefono: '',
    tipo_examen_id: '',
    fecha_examen: new Date().toISOString().split('T')[0],
    observaciones: '',
    dias_vigencia: 30,
  });
  const [archivo, setArchivo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] = useState(false);

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
    transition: 'border-color 0.2s',
  };

  const tipoSeleccionado = tipos.find(t => t.id === form.tipo_examen_id);

  const buscarPaciente = async (rut) => {
    if (!rut || rut.length < 8) return;
    const rutClean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    setBuscando(true);
    try {
      const res = await api.get(`/api/pacientes/buscar/${rutClean}`);
      if (res.data.success) {
        const paciente = res.data.data;
        setForm(prev => ({
          ...prev,
          nombre_paciente: paciente.nombre || '',
          email: paciente.email || '',
          telefono: paciente.telefono || '',
        }));
        setPacienteEncontrado(true);
      } else {
        setForm(prev => ({
          ...prev,
          nombre_paciente: '',
          email: '',
          telefono: '',
        }));
        setPacienteEncontrado(false);
      }
    } catch (err) {
      setForm(prev => ({
        ...prev,
        nombre_paciente: '',
        email: '',
        telefono: '',
      }));
      setPacienteEncontrado(false);
    } finally {
      setBuscando(false);
    }
  };

  const handleRutChange = (e) => {
    const nuevoRut = formatRut(e.target.value);
    setForm(prev => ({ ...prev, rut_paciente: nuevoRut }));
    setForm(prev => ({
      ...prev,
      nombre_paciente: '',
      email: '',
      telefono: '',
    }));
    setPacienteEncontrado(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setError('Selecciona un archivo PDF');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('archivo', archivo);
      fd.append('rut_paciente', form.rut_paciente.replace(/\./g, '').replace(/-/g, '').toUpperCase());
      fd.append('nombre_paciente', form.nombre_paciente);
      fd.append('email', form.email);
      fd.append('telefono', form.telefono);
      fd.append('tipo_examen_id', form.tipo_examen_id);
      fd.append('fecha_examen', form.fecha_examen);
      fd.append('observaciones', form.observaciones);
      fd.append('dias_vigencia', form.dias_vigencia);

      const res = await api.post('/api/examenes', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResultado(res.data.data);
      onExito();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al subir el examen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: C.card, borderRadius: '20px', width: '100%', maxWidth: '560px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: C.textP }}>📤 Subir Resultado de Examen</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: C.textS }}>×</button>
        </div>

        {resultado ? (
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: C.textP }}>¡Examen subido exitosamente!</h3>
            <p style={{ color: C.textS, fontSize: '14px', marginBottom: '24px' }}>Entrega esta boleta al paciente para que pueda descargar su resultado.</p>
            <div style={{ background: dark ? '#0f172a' : '#f8fafc', border: `2px dashed ${C.border}`, borderRadius: '16px', padding: '24px', textAlign: 'left', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textM }}>CESFAM VALLE MAR — BOLETA DE ACCESO</p>
              <div style={{ height: '1px', background: C.border, margin: '10px 0' }} />
              <div style={{ display: 'grid', gap: '8px' }}>
                {[
                  ['Paciente', resultado.paciente_nombre],
                  ['RUT', resultado.paciente_rut],
                  ['Examen', resultado.tipo_examen],
                  ['Fecha', resultado.fecha_examen],
                  ['Vigencia', resultado.expira_en],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: C.textS }}>{k}:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: C.textP }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: '1px', background: C.border }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: C.textP }}>CONTRASEÑA:</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.15em', fontFamily: 'monospace', color: '#2563eb' }}>{resultado.password_temporal}</span>
                </div>
                <div style={{ height: '1px', background: C.border }} />
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '11px', color: C.textM }}>Sitio web: cesfamvallemar.cl → Resultados de Exámenes<br />Ingrese su RUT y la contraseña indicada arriba.</p>
            </div>
            <button onClick={onClose} style={{ width: '100%', padding: '12px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
            {error && (
              <div style={{ padding: '10px 14px', background: dark ? 'rgba(239,68,68,0.12)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`, borderRadius: '10px', fontSize: '13px', color: dark ? '#fca5a5' : '#dc2626' }}>
                {error}
              </div>
            )}

            {/* RUT Paciente */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>RUT Paciente *</label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  value={form.rut_paciente}
                  onChange={handleRutChange}
                  onBlur={() => buscarPaciente(form.rut_paciente)}
                  placeholder="12.345.678-9"
                  maxLength={12}
                  style={inp}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                />
                {buscando && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: C.textM }}>🔄</span>}
              </div>
            </div>

            {/* Nombre (solo lectura si paciente encontrado) */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>Nombre Paciente *</label>
              <input
                required
                value={form.nombre_paciente}
                onChange={e => setForm(p => ({ ...p, nombre_paciente: e.target.value }))}
                readOnly={pacienteEncontrado}
                placeholder="Juan Pérez García"
                style={inp}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>Correo electrónico (opcional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  readOnly={pacienteEncontrado}
                  placeholder="paciente@ejemplo.cl"
                  style={inp}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  readOnly={pacienteEncontrado}
                  placeholder="+56 9 1234 5678"
                  style={inp}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                />
              </div>
            </div>

            {/* Tipo de examen, fecha, vigencia, observaciones, archivo, botones... (todo igual) */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>Tipo de Examen *</label>
              <select
                required
                value={form.tipo_examen_id}
                onChange={e => setForm(p => ({ ...p, tipo_examen_id: e.target.value }))}
                style={{ ...inp, cursor: 'pointer' }}
              >
                <option value="">Seleccionar examen…</option>
                {['Preventivos y Detección', 'Laboratorio y Sangre', 'Otros Exámenes'].map(grupo => (
                  <optgroup key={grupo} label={grupo}>
                    {tipos.filter(t => t.grupo === grupo).map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {tipoSeleccionado?.requiere_ayuno && (
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#f59e0b' }}>⚡ Este examen requiere ayuno de {tipoSeleccionado.horas_ayuno} horas</p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>Fecha del Examen *</label>
                <input
                  required
                  type="date"
                  value={form.fecha_examen}
                  onChange={e => setForm(p => ({ ...p, fecha_examen: e.target.value }))}
                  style={{ ...inp, colorScheme: dark ? 'dark' : 'light' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>Vigencia (días) *</label>
                <select
                  value={form.dias_vigencia}
                  onChange={e => setForm(p => ({ ...p, dias_vigencia: e.target.value }))}
                  style={{ ...inp, cursor: 'pointer' }}
                >
                  <option value={7}>7 días</option>
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                  <option value={60}>60 días</option>
                  <option value={90}>90 días</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>Observaciones (opcional)</label>
              <textarea
                rows={2}
                value={form.observaciones}
                onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
                placeholder="Notas adicionales para el paciente…"
                style={{ ...inp, resize: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: C.textS, display: 'block', marginBottom: '5px' }}>Archivo PDF *</label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  border: `2px dashed ${archivo ? '#22c55e' : C.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: archivo ? (dark ? 'rgba(34,197,94,0.08)' : '#f0fdf4') : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <FileText size={20} style={{ color: archivo ? '#22c55e' : C.textM, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: archivo ? '#22c55e' : C.textP }}>
                    {archivo ? archivo.name : 'Seleccionar archivo PDF'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.textM }}>
                    {archivo ? `${(archivo.size / 1024 / 1024).toFixed(2)} MB` : 'Máximo 20 MB'}
                  </p>
                </div>
                <input type="file" accept=".pdf,application/pdf" onChange={e => setArchivo(e.target.files[0] ?? null)} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: `1.5px solid ${C.border}`, borderRadius: '10px', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: C.textP }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px', border: 'none', borderRadius: '10px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {saving ? <><RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Subiendo…</> : <><Upload size={15} /> Subir examen y generar contraseña</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ── Página principal admin (sin cambios) ───────────── */
const AdminExamenes = () => {
  // ... (todo igual que antes, no necesita cambios)
  const [examenes, setExamenes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [buscarRut, setBuscarRut] = useState('');
  const [regenInfo, setRegenInfo] = useState(null);
  const { dark } = useTheme();

  const C = {
    card: dark ? '#1e293b' : '#ffffff',
    border: dark ? '#334155' : '#e2e8f0',
    textP: dark ? '#f1f5f9' : '#0f172a',
    textS: dark ? '#94a3b8' : '#64748b',
    textM: dark ? '#64748b' : '#94a3b8',
    inputBg: dark ? '#0f172a' : '#ffffff',
    thBg: dark ? '#0f172a' : '#f8fafc',
    rowHov: dark ? '#273549' : '#f9fafb',
    shadow: dark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const [ex, ti] = await Promise.all([
        api.get(`/api/examenes${buscarRut ? `?rut=${buscarRut.replace(/\./g, '').replace(/-/g, '')}` : ''}`),
        api.get('/api/examenes/tipos'),
      ]);
      setExamenes(ex.data.data ?? []);
      setTipos(ti.data.data ?? []);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este examen? El paciente ya no podrá descargarlo.')) return;
    try {
      await api.delete(`/api/examenes/${id}`);
      cargar();
    } catch {
      alert('Error al eliminar');
    }
  };

  const regenerar = async (id) => {
    if (!confirm('¿Regenerar la contraseña? La anterior quedará inválida.')) return;
    try {
      const res = await api.patch(`/api/examenes/${id}/regenerar`, { dias_vigencia: 30 });
      setRegenInfo(res.data.data);
    } catch {
      alert('Error al regenerar');
    }
  };

  return (
    <AdminLayout>
      {modal && <ModalSubir tipos={tipos} dark={dark} C={C} onClose={() => setModal(false)} onExito={() => cargar()} />}
      {regenInfo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: C.card, borderRadius: '20px', width: '100%', maxWidth: '360px', padding: '32px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: C.textP }}>Nueva Contraseña Generada</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: C.textS }}>Entrega esta contraseña al paciente</p>
            <div style={{ padding: '16px', background: dark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '0.15em', fontFamily: 'monospace', color: '#2563eb' }}>{regenInfo.nueva_password}</p>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: C.textM }}>Vigente por {regenInfo.expira_en}</p>
            </div>
            <button onClick={() => setRegenInfo(null)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div><h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: C.textP }}>Resultados de Exámenes</h1><p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textS }}>{examenes.length} exámenes registrados</p></div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}><Upload size={16} /> Subir examen</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.textM, pointerEvents: 'none' }} />
          <input value={buscarRut} onChange={e => setBuscarRut(formatRut(e.target.value))} placeholder="Buscar por RUT…" style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '36px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', border: `1.5px solid ${C.border}`, borderRadius: '10px', fontSize: '13px', outline: 'none', background: C.inputBg, color: C.textP }} />
        </div>
        <button onClick={cargar} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: `1px solid ${C.border}`, borderRadius: '10px', background: C.card, color: C.textS, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}><Search size={14} /> Buscar</button>
      </div>

      <div style={{ background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: C.shadow }}>
        {loading ? (<div style={{ padding: '48px', textAlign: 'center', color: C.textS }}>Cargando…</div>) : examenes.length === 0 ? (<div style={{ padding: '48px', textAlign: 'center', color: C.textS }}><div style={{ fontSize: '40px', marginBottom: '12px' }}>🔬</div>No hay exámenes registrados.</div>) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead><tr style={{ background: C.thBg, borderBottom: `1px solid ${C.border}` }}>
                {['Paciente / RUT', 'Examen', 'Fecha', 'Expira', 'Descargas', ''].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: C.textM, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {examenes.map((ex, i) => {
                  const expira = ex.password_expira ? new Date(ex.password_expira) : null;
                  const vencido = expira && expira < new Date();
                  return (
                    <tr key={ex.id} style={{ borderBottom: i < examenes.length - 1 ? `1px solid ${C.border}` : 'none', background: C.card, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = C.rowHov} onMouseLeave={e => e.currentTarget.style.background = C.card}>
                      <td style={{ padding: '14px 16px' }}><p style={{ margin: 0, fontWeight: '600', color: C.textP }}>{ex.paciente_nombre}</p><p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textM, fontFamily: 'monospace' }}>{ex.rut}</p></td>
                      <td style={{ padding: '14px 16px' }}><p style={{ margin: 0, color: C.textP }}>{ex.tipo_nombre}</p><p style={{ margin: '2px 0 0', fontSize: '11px', color: C.textM }}>{ex.grupo}</p></td>
                      <td style={{ padding: '14px 16px', color: C.textS, whiteSpace: 'nowrap' }}>{new Date(ex.fecha_examen).toLocaleDateString('es-CL')}</td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: vencido ? (dark ? 'rgba(239,68,68,0.15)' : '#fef2f2') : (dark ? 'rgba(34,197,94,0.15)' : '#f0fdf4'), color: vencido ? '#ef4444' : '#22c55e' }}>{vencido ? '⚠ Vencido' : expira ? `${Math.ceil((expira - new Date()) / 86400000)}d` : '∞'}</span></td>
                      <td style={{ padding: '14px 16px', color: C.textS }}>{ex.descargas_count}/{ex.descargas_max}</td>
                      <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button onClick={() => regenerar(ex.id)} title="Regenerar contraseña" style={{ padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '14px' }} onMouseEnter={e => e.currentTarget.style.background = dark ? '#334155' : '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>🔑</button>
                        <button onClick={() => eliminar(ex.id)} title="Eliminar" style={{ padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '14px' }} onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>🗑️</button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminExamenes;