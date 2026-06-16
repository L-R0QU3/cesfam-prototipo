import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Contacto = () => {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const { dark } = useTheme();

  const C = {
    page:    dark ? '#0f172a' : '#f8fafc',
    card:    dark ? '#1e293b' : '#ffffff',
    border:  dark ? '#334155' : '#e5e7eb',
    textP:   dark ? '#f1f5f9' : '#111827',
    textS:   dark ? '#94a3b8' : '#6b7280',
    textM:   dark ? '#64748b' : '#9ca3af',
    inputBg: dark ? '#0f172a' : '#ffffff',
    inputBr: dark ? '#334155' : '#e5e7eb',
    labelC:  dark ? '#94a3b8' : '#374151',
    mapBg:   dark ? 'linear-gradient(135deg,#0c1e3b,#0c2a2a)' : 'linear-gradient(135deg,#eff6ff,#f0fdfa)',
    shadow:  dark ? '0 1px 4px rgba(0,0,0,0.35)' : '0 1px 4px rgba(0,0,0,0.07)',
    hoverBg: dark ? '#273549' : '#f9fafb',
  };

  const INFO_CARDS = [
    {
      icon:    MapPin,
      bg:      dark ? 'rgba(59,130,246,0.15)'  : '#eff6ff',
      iconClr: '#3b82f6',
      titulo:  'Dirección',
      lineas:  ['Av. Principal 123', 'Navidad, Región del Libertador', "O'Higgins, Chile"],
    },
    {
      icon:    Phone,
      bg:      dark ? 'rgba(34,197,94,0.15)'   : '#f0fdf4',
      iconClr: '#22c55e',
      titulo:  'Teléfono',
      lineas:  ['+56 72 241 2345', 'Urgencias: 131'],
    },
    {
      icon:    Mail,
      bg:      dark ? 'rgba(139,92,246,0.15)'  : '#f5f3ff',
      iconClr: '#8b5cf6',
      titulo:  'Correo',
      lineas:  ['contacto@cesfamvallemar.cl', 'urgencias@cesfamvallemar.cl'],
    },
    {
      icon:    Clock,
      bg:      dark ? 'rgba(249,115,22,0.15)'  : '#fff7ed',
      iconClr: '#f97316',
      titulo:  'Horario',
      lineas:  ['Lunes a Viernes: 08:00 – 17:00', 'Urgencias: 24/7'],
    },
  ];

  const card = (extra = {}) => ({
    background:   C.card,
    borderRadius: '16px',
    border:       `1px solid ${C.border}`,
    boxShadow:    C.shadow,
    transition:   'background 0.2s, border-color 0.2s',
    ...extra,
  });

  const inp = {
    width:        '100%',
    boxSizing:    'border-box',
    border:       `1.5px solid ${C.inputBr}`,
    borderRadius: '12px',
    padding:      '12px 16px',
    fontSize:     '14px',
    background:   C.inputBg,
    color:        C.textP,
    outline:      'none',
    transition:   'border-color 0.2s',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => setEnviado(false), 4000);
    setForm({ nombre: '', email: '', mensaje: '' });
  };

  return (
    <main style={{ background: C.page, minHeight: '100vh', transition: 'background 0.2s' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(to right, #1e3a5f, #2563eb)', padding: '56px 16px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ color: '#93c5fd', fontSize: '13px', marginBottom: '8px' }}>CESFAM Valle Mar</p>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,5vw,40px)', fontWeight: '800', margin: '0 0 8px' }}>
            Contacto
          </h1>
          <p style={{ color: '#bfdbfe', margin: 0, lineHeight: 1.6 }}>
            Estamos aquí para ayudarte. Contáctanos por el medio que prefieras.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        {/* Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: '14px',
          marginBottom: '40px',
        }}>
          {INFO_CARDS.map(({ icon: Icon, bg, iconClr, titulo, lineas }) => (
            <div key={titulo} style={card({ padding: '20px', textAlign: 'center' })}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: bg, margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} style={{ color: iconClr }} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '700', color: C.textP }}>
                {titulo}
              </h3>
              {lineas.map(l => (
                <p key={l} style={{ margin: '2px 0', fontSize: '13px', color: C.textS }}>{l}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Formulario + Mapa */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
          {/* Formulario */}
          <div style={card({ padding: '32px' })}>
            <h2 style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: '800', color: C.textP }}>
              Envíanos un mensaje
            </h2>

            {enviado && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: dark ? 'rgba(34,197,94,0.12)' : '#f0fdf4',
                border: `1px solid ${dark ? 'rgba(34,197,94,0.3)' : '#bbf7d0'}`,
                borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
              }}>
                <CheckCircle size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: dark ? '#86efac' : '#166534' }}>
                  ¡Mensaje enviado! Te responderemos pronto.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.labelC, marginBottom: '6px' }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Juan Pérez"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = C.inputBr}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.labelC, marginBottom: '6px' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="juan@ejemplo.cl"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = C.inputBr}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.labelC, marginBottom: '6px' }}>
                  Mensaje
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.mensaje}
                  onChange={e => setForm(p => ({ ...p, mensaje: e.target.value }))}
                  placeholder="¿En qué podemos ayudarte?"
                  style={{ ...inp, resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = C.inputBr}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '13px',
                  background: 'linear-gradient(to right, #1e3a5f, #2563eb)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Enviar mensaje
              </button>
            </form>
          </div>

          {/* Mapa (corregido) */}
          <div style={card({ overflow: 'hidden' })}>
            {/* Área mapa */}
            <div style={{
              height: '220px',
              background: C.mapBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: dark ? 'rgba(59,130,246,0.2)' : '#dbeafe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <MapPin size={28} style={{ color: '#3b82f6' }} />
                </div>
                <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '15px', color: C.textP }}>
                  CESFAM Valle Mar
                </p>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: C.textS }}>
                  Navidad, O'Higgins
                </p>
                {/* 👇 Aquí estaba el error: faltaba la apertura de la etiqueta <a> */}
                <a
                  href="https://maps.google.com/?q=Navidad,Chile"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#3b82f6', fontSize: '13px', fontWeight: '600',
                    textDecoration: 'none',
                    padding: '6px 16px', borderRadius: '8px',
                    background: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff',
                    border: `1px solid ${dark ? 'rgba(59,130,246,0.3)' : '#bfdbfe'}`,
                    display: 'inline-block',
                  }}
                >
                  Ver en Google Maps →
                </a>
              </div>
            </div>

            {/* Cómo llegar */}
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: C.textP }}>
                Cómo llegar
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { emoji: '🚌', text: 'Bus desde San Antonio: línea 222, parada CESFAM' },
                  { emoji: '🚗', text: 'Por Ruta 90, desvío en el km 142 hacia Navidad'  },
                  { emoji: '🅿️', text: 'Estacionamiento disponible frente al CESFAM'    },
                ].map(({ emoji, text }) => (
                  <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: C.textS }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>{emoji}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contacto;