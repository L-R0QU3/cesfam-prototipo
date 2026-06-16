import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText, Lock, Download, Clock,
  AlertCircle, CheckCircle, Eye, EyeOff,
  ChevronDown, ChevronUp, Loader, LogOut,
  Shield, User, Mail, Phone, UserPlus, LogIn, KeyRound,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const formatRut = (val) => {
  const clean = val.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};

const validarRutCompleto = (rut) => {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (!/^[0-9]+[0-9K]$/.test(clean)) return false;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  return dvCalculado === dv;
};

const GRUPO_CONFIG = {
  'Preventivos y Detección': { bg: 'rgba(16,185,129,0.15)', color: '#10b981', emoji: '🛡️' },
  'Laboratorio y Sangre':    { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', emoji: '🔬' },
  'Otros Exámenes':          { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', emoji: '📋' },
};

const ExamenCard = ({ examen, token, dark, C }) => {
  const [descargando, setDescargando] = useState(false);
  const [descargado, setDescargado] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [error, setError] = useState('');

  const grp = GRUPO_CONFIG[examen.grupo] ?? GRUPO_CONFIG['Otros Exámenes'];

  const descargar = async () => {
    setDescargando(true);
    setError('');
    try {
      const res = await fetch(`/api/examenes/download/${examen.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Error al descargar');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${examen.tipo}_${examen.fecha_examen}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDescargado(true);
      setTimeout(() => setDescargado(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div style={{ background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: 'hidden', transition: 'background 0.2s' }}>
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: grp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
          {grp.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: grp.bg, color: grp.color }}>{examen.grupo}</span>
            {examen.requiere_ayuno && <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: dark ? 'rgba(245,158,11,0.15)' : '#fef3c7', color: dark ? '#fcd34d' : '#92400e' }}>⚡ Ayuno {examen.horas_ayuno}h</span>}
          </div>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: C.textP }}>{examen.tipo}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: C.textS }}>Fecha: {new Date(examen.fecha_examen).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {examen.descargas_restantes !== undefined && <p style={{ margin: '3px 0 0', fontSize: '11px', color: C.textM }}>{examen.descargas_restantes} descarga{examen.descargas_restantes !== 1 ? 's' : ''} disponible{examen.descargas_restantes !== 1 ? 's' : ''}</p>}
          {examen.observaciones && <p style={{ margin: '6px 0 0', fontSize: '12px', color: C.textS, fontStyle: 'italic' }}>💬 {examen.observaciones}</p>}
        </div>
        <button onClick={descargar} disabled={descargando} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: descargado ? (dark ? 'rgba(34,197,94,0.2)' : '#dcfce7') : 'linear-gradient(to right,#1e3a5f,#2563eb)', color: descargado ? (dark ? '#86efac' : '#166534') : 'white', border: 'none', cursor: descargando ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', flexShrink: 0, transition: 'all 0.2s', opacity: descargando ? 0.7 : 1 }}>
          {descargando ? <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : descargado ? <CheckCircle size={15} /> : <Download size={15} />}
          {descargando ? 'Descargando…' : descargado ? '¡Listo!' : 'PDF'}
        </button>
      </div>
      {error && <div style={{ margin: '0 20px 14px', padding: '10px 14px', background: dark ? 'rgba(239,68,68,0.12)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`, borderRadius: '10px', fontSize: '12px', color: dark ? '#fca5a5' : '#dc2626' }}>⚠️ {error}</div>}
      {examen.instrucciones && (
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => setExpandido(v => !v)} style={{ width: '100%', padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.textS, fontWeight: '500' }}>
            {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expandido ? 'Ocultar instrucciones' : 'Ver instrucciones'}
          </button>
          {expandido && <div style={{ padding: '0 20px 14px', fontSize: '13px', color: C.textS, lineHeight: 1.6 }}>📋 {examen.instrucciones}</div>}
        </div>
      )}
    </div>
  );
};

// ── Componente de login/registro por email ─────────────────
const FormMiCuenta = ({ onExito, dark, C, errorExterno }) => {
  const [modo, setModo] = useState('login'); // login, registro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Registro
  const [regRut, setRegRut] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regPass, setRegPass] = useState('');

  useEffect(() => {
    if (errorExterno) setError(errorExterno);
  }, [errorExterno]);

  const inp = {
    width: '100%', boxSizing: 'border-box',
    border: `1.5px solid ${C.inputBr}`, borderRadius: '12px',
    padding: '13px 16px', fontSize: '15px',
    background: C.inputBg, color: C.textP, outline: 'none',
    transition: 'border-color 0.2s',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/pacientes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Credenciales inválidas');
      const { token, paciente } = data.data;
      // Obtener exámenes
      const examenesRes = await fetch('/api/examenes/mis-examenes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const examenesData = await examenesRes.json();
      if (!examenesData.success) throw new Error(examenesData.message);
      onExito({ token, paciente, examenes: examenesData.data, via: 'email' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (!validarRutCompleto(regRut)) {
      setError('RUT inválido');
      return;
    }
    if (regPass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/pacientes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: regRut,
          email: regEmail,
          nombre: regNombre,
          telefono: regTelefono,
          password: regPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error en el registro');
      const { token, paciente } = data.data;
      const examenesRes = await fetch('/api/examenes/mis-examenes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const examenesData = await examenesRes.json();
      onExito({ token, paciente, examenes: examenesData.data, via: 'email' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (modo === 'login') {
    return (
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <div style={{ padding: '12px', background: dark ? 'rgba(239,68,68,0.12)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`, borderRadius: '12px', fontSize: '13px', color: dark ? '#fca5a5' : '#dc2626' }}>{error}</div>}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>Correo electrónico</label>
          <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={inp} placeholder="tu@email.cl" onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = C.inputBr} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} required value={loginPass} onChange={e => setLoginPass(e.target.value)} style={{ ...inp, paddingRight: '48px' }} placeholder="••••••••" onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = C.inputBr} />
            <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textM, minHeight: 'unset', minWidth: 'unset', padding: '4px' }}>{showPass ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: loading ? 0.8 : 1 }}>
          {loading ? <Loader size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <LogIn size={17} />}
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
        <p style={{ marginTop: '12px', fontSize: '12px', textAlign: 'center', color: C.textS }}>
          ¿No tienes cuenta? <button type="button" onClick={() => setModo('registro')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>Regístrate aquí</button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {error && <div style={{ padding: '12px', background: dark ? 'rgba(239,68,68,0.12)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`, borderRadius: '12px', fontSize: '13px', color: dark ? '#fca5a5' : '#dc2626' }}>{error}</div>}
      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>RUT *</label><input type="text" required value={regRut} onChange={e => setRegRut(formatRut(e.target.value))} maxLength={12} style={inp} placeholder="12.345.678-9" /></div>
      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>Nombre completo *</label><input type="text" required value={regNombre} onChange={e => setRegNombre(e.target.value)} style={inp} placeholder="Juan Pérez García" /></div>
      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>Correo electrónico *</label><input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} style={inp} placeholder="tu@email.cl" /></div>
      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>Teléfono (opcional)</label><input type="tel" value={regTelefono} onChange={e => setRegTelefono(e.target.value)} style={inp} placeholder="+56 9 1234 5678" /></div>
      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>Contraseña * (mínimo 6 caracteres)</label><div style={{ position: 'relative' }}><input type={showPass ? 'text' : 'password'} required value={regPass} onChange={e => setRegPass(e.target.value)} style={{ ...inp, paddingRight: '48px' }} placeholder="••••••••" /><button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textM, minHeight: 'unset', minWidth: 'unset', padding: '4px' }}>{showPass ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {loading ? <Loader size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <UserPlus size={17} />}
        {loading ? 'Registrando...' : 'Crear cuenta y ver mis exámenes'}
      </button>
      <p style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', color: C.textS }}>¿Ya tienes cuenta? <button type="button" onClick={() => setModo('login')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>Inicia sesión</button></p>
    </form>
  );
};

// ── Formulario de acceso con contraseña temporal ───────────
const FormContraseñaTemporal = ({ onExito, dark, C, errorExterno }) => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (errorExterno) setError(errorExterno);
  }, [errorExterno]);

  const inp = {
    width: '100%', boxSizing: 'border-box',
    border: `1.5px solid ${C.inputBr}`, borderRadius: '12px',
    padding: '13px 16px', fontSize: '15px',
    background: C.inputBg, color: C.textP, outline: 'none',
    transition: 'border-color 0.2s',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/examenes/acceder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Credenciales incorrectas');
      onExito(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div style={{ padding: '12px', background: dark ? 'rgba(239,68,68,0.12)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`, borderRadius: '12px', fontSize: '13px', color: dark ? '#fca5a5' : '#dc2626' }}>{error}</div>}
      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>RUT del Paciente</label><input type="text" required value={rut} onChange={e => setRut(formatRut(e.target.value))} maxLength={12} style={inp} placeholder="12.345.678-9" onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = C.inputBr} /></div>
      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textS, marginBottom: '6px' }}>Contraseña temporal</label><div style={{ position: 'relative' }}><input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value.toUpperCase())} placeholder="Ej: ABC12345" style={{ ...inp, paddingRight: '48px', letterSpacing: '0.12em', fontFamily: 'monospace', fontSize: '16px' }} /><button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textM, minHeight: 'unset', minWidth: 'unset', padding: '4px' }}>{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right,#1e3a5f,#2563eb)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: loading ? 0.8 : 1 }}>
        {loading ? <Loader size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <KeyRound size={17} />}
        {loading ? 'Verificando...' : 'Acceder con contraseña temporal'}
      </button>
    </form>
  );
};

// ── Botón ClaveÚnica ─────────────────────────────────────
const BotonClaveUnica = ({ dark }) => {
  const iniciar = () => {
    window.location.href = '/api/auth/claveunica/login?tipo=paciente';
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: dark ? '#334155' : '#e5e7eb' }} />
        <span style={{ fontSize: '12px', color: dark ? '#64748b' : '#9ca3af', fontWeight: '500' }}>O ingresa con</span>
        <div style={{ flex: 1, height: '1px', background: dark ? '#334155' : '#e5e7eb' }} />
      </div>
      <button onClick={iniciar} style={{ width: '100%', padding: '13px 20px', background: dark ? '#0c1e3b' : '#003087', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'opacity 0.2s', fontWeight: '600', fontSize: '14px' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
        <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: '14px' }}>🇨🇱</span></div>
        <div style={{ textAlign: 'left' }}><div style={{ fontSize: '14px', fontWeight: '700' }}>Ingresar con ClaveÚnica</div><div style={{ fontSize: '11px', opacity: 0.8 }}>Sistema oficial del Gobierno de Chile</div></div>
        <Shield size={16} style={{ marginLeft: 'auto', opacity: 0.7 }} />
      </button>
      <p style={{ margin: '8px 0 0', fontSize: '11px', textAlign: 'center', color: dark ? '#475569' : '#9ca3af' }}>🔒 Autenticación segura — No almacenamos tu contraseña de ClaveÚnica</p>
    </div>
  );
};

// ── Vista de exámenes (cuando ya está autenticado) ─────────
const VistaExamenes = ({ datos, onCerrar, dark, C }) => {
  const { paciente, examenes, token, via } = datos;

  const grupos = examenes.reduce((acc, ex) => {
    if (!acc[ex.grupo]) acc[ex.grupo] = [];
    acc[ex.grupo].push(ex);
    return acc;
  }, {});

  return (
    <main style={{ background: C.page, minHeight: '100vh', transition: 'background 0.2s' }}>
      <div style={{ background: 'linear-gradient(to right,#1e3a5f,#2563eb)', padding: '32px 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <p style={{ color: '#93c5fd', fontSize: '13px', margin: 0 }}>Portal de Resultados</p>
              {via === 'claveunica' && <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', fontSize: '11px', color: '#bfdbfe', display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={11} /> ClaveÚnica</span>}
              {via === 'email' && <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', fontSize: '11px', color: '#bfdbfe', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} /> Cuenta CESFAM</span>}
            </div>
            <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>{paciente.nombre}</h1>
            <p style={{ color: '#bfdbfe', margin: 0, fontSize: '13px' }}>RUT: {paciente.rut} · {examenes.length} resultado{examenes.length !== 1 ? 's' : ''} disponible{examenes.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onCerrar} style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><LogOut size={15} /> Cerrar sesión</button>
        </div>
      </div>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: dark ? 'rgba(245,158,11,0.10)' : '#fffbeb', border: `1px solid ${dark ? 'rgba(245,158,11,0.25)' : '#fde68a'}`, borderRadius: '12px', fontSize: '12px', color: dark ? '#fcd34d' : '#92400e' }}>
          <Clock size={14} style={{ flexShrink: 0 }} />
          Sesión válida por {via === 'claveunica' ? '8 horas' : '24 horas'}. Cierra sesión al terminar.
        </div>
      </div>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px 48px' }}>
        {Object.entries(grupos).map(([grupo, exams]) => {
          const grp = GRUPO_CONFIG[grupo] ?? GRUPO_CONFIG['Otros Exámenes'];
          return (
            <div key={grupo} style={{ marginBottom: '32px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: C.textP, marginBottom: '14px' }}>
                <span style={{ fontSize: '20px' }}>{grp.emoji}</span>
                {grupo}
                <span style={{ fontSize: '13px', fontWeight: '600', padding: '2px 10px', borderRadius: '20px', background: grp.bg, color: grp.color }}>{exams.length}</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {exams.map(ex => <ExamenCard key={ex.id} examen={ex} token={token} dark={dark} C={C} />)}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

// ── Página principal del portal ─────────────────────────
const PortalExamenes = () => {
  const { dark } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);
  const [errorParam, setErrorParam] = useState('');

  const C = {
    page: dark ? '#0f172a' : '#f8fafc',
    card: dark ? '#1e293b' : '#ffffff',
    border: dark ? '#334155' : '#e5e7eb',
    textP: dark ? '#f1f5f9' : '#111827',
    textS: dark ? '#94a3b8' : '#6b7280',
    textM: dark ? '#64748b' : '#9ca3af',
    inputBg: dark ? '#0f172a' : '#ffffff',
    inputBr: dark ? '#334155' : '#e5e7eb',
    shadow: dark ? '0 1px 4px rgba(0,0,0,0.35)' : '0 1px 4px rgba(0,0,0,0.07)',
  };

  useEffect(() => {
    const token = searchParams.get('token');
    const nombre = searchParams.get('nombre');
    const rut = searchParams.get('rut');
    const via = searchParams.get('via');
    const err = searchParams.get('error');
    const msg = searchParams.get('msg');

    if (err) {
      setErrorParam(msg ?? 'Error de autenticación con ClaveÚnica');
      navigate('/examenes', { replace: true });
      return;
    }

    if (token && via === 'claveunica') {
      fetch('/api/examenes/mis-examenes', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setResultado({
              token,
              via: 'claveunica',
              paciente: { nombre: decodeURIComponent(nombre ?? ''), rut: decodeURIComponent(rut ?? '') },
              examenes: data.data ?? [],
            });
          } else {
            setErrorParam('No se pudieron cargar tus exámenes');
          }
        })
        .catch(() => setErrorParam('Error al cargar tus exámenes'));
      navigate('/examenes', { replace: true });
    }
  }, [searchParams, navigate]);

  const cerrarSesion = () => {
    setResultado(null);
    setErrorParam('');
  };

  if (resultado) {
    return <VistaExamenes datos={resultado} onCerrar={cerrarSesion} dark={dark} C={C} />;
  }

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <main style={{ background: C.page, minHeight: '100vh', transition: 'background 0.2s' }}>
        <div style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 60%,#0891b2 100%)', padding: '56px 16px', textAlign: 'center' }}>
          <div style={{ maxWidth: '580px', margin: '0 auto' }}>
            <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.15)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px', backdropFilter: 'blur(8px)' }}>🔬</div>
            <h1 style={{ color: 'white', fontSize: 'clamp(24px,5vw,38px)', fontWeight: '800', margin: '0 0 12px' }}>Portal de Resultados</h1>
            <p style={{ color: '#bfdbfe', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>Accede de forma segura a tus resultados de exámenes del CESFAM Valle Mar</p>
          </div>
        </div>

        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 16px 60px' }}>
          <div style={{ background: C.card, borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ padding: '16px', textAlign: 'center', background: dark ? 'rgba(59,130,246,0.08)' : '#eff6ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
                  <Mail size={14} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: dark ? '#93c5fd' : '#1d4ed8' }}>Mi cuenta</span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: C.textM }}>Email y contraseña</p>
              </div>
              <div style={{ padding: '16px', textAlign: 'center', background: dark ? 'rgba(0,48,135,0.15)' : '#f0f7ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
                  <KeyRound size={14} style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: dark ? '#93c5fd' : '#1d4ed8' }}>Contraseña temporal</span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: C.textM }}>Entregada por tu médico</p>
              </div>
            </div>

            <div style={{ padding: '28px' }}>
              {/* Pestaña 1: Mi cuenta (email) */}
              <FormMiCuenta onExito={setResultado} dark={dark} C={C} errorExterno={errorParam} />
              {/* Botón ClaveÚnica adicional (debajo de ambas pestañas) */}
              <BotonClaveUnica dark={dark} />
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { emoji: '🔒', titulo: 'Acceso seguro', texto: 'Encriptación de extremo a extremo' },
              { emoji: '📋', titulo: 'Todos tus exámenes', texto: 'Historial completo disponible' },
              { emoji: '⏱️', titulo: 'Siempre disponible', texto: 'Acceso las 24 horas del día' },
              { emoji: '📱', titulo: 'Desde cualquier dispositivo', texto: 'Móvil, tablet o computador' },
            ].map(({ emoji, titulo, texto }) => (
              <div key={titulo} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{emoji}</div>
                <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: '700', color: C.textP }}>{titulo}</p>
                <p style={{ margin: 0, fontSize: '11px', color: C.textM }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default PortalExamenes;