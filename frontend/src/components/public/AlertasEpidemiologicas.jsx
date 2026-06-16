import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const AlertasEpidemiologicas = () => {
  const [alertas, setAlertas] = useState([]);
  const { dark } = useTheme();

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const res = await api.get('/api/alertas/activas');
        setAlertas(res.data.data || []);
      } catch (err) {
        console.error('Error cargando alertas:', err);
      }
    };
    fetchAlertas();
  }, []);

  if (alertas.length === 0) return null;

  const cardBg = dark ? '#1e293b' : '#ffffff';
  const textPrimary = dark ? '#f1f5f9' : '#111827';
  const textSecondary = dark ? '#94a3b8' : '#6b7280';
  const borderColor = dark ? '#334155' : '#e2e8f0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="section-title" style={{ color: textPrimary }}>⚠️ Alertas Epidemiológicas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertas.map(alerta => (
          <div
            key={alerta.id}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '16px',
              padding: '16px',
              boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="text-2xl">{alerta.icono || '⚠️'}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: textPrimary }}>
                {alerta.titulo}
              </h3>
            </div>
            <p style={{ margin: 0, color: textSecondary }}>{alerta.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertasEpidemiologicas;