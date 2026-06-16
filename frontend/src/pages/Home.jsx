import Hero                   from '../components/public/Hero';
import BannerCarousel         from '../components/public/BannerCarousel';
import AlertasEpidemiologicas from '../components/public/AlertasEpidemiologicas';
import ProgramasGrid          from '../components/public/ProgramasGrid';
import NoticiasPreview          from '../components/public/NoticiasPreview';
import { Link }               from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useTheme }           from '../context/ThemeContext';

const Home = () => {
  const { dark } = useTheme();
  const bg = dark ? '#0f172a' : '#f8fafc';

  return (
    <main style={{
      background: bg,
      minHeight:  '100vh',
      transition: 'background 0.2s',
    }}>
      {/* Hero — foto + overlay */}
      <Hero />

      {/* Carrusel de banners informativos (dinámicos desde el panel admin) */}
      <div style={{ background: bg, transition: 'background 0.2s' }}>
        <BannerCarousel />
      </div>

      {/* Alertas epidemiológicas */}
      <div style={{ background: bg, paddingTop: '16px', transition: 'background 0.2s' }}>
        <AlertasEpidemiologicas />
      </div>

      {/* Programas de salud */}
      <ProgramasGrid />

      {/* Últimas noticias (con imagen y modal) */}
      <NoticiasPreview />

      {/* Banner Red Rural */}
      <section style={{
        padding:    '64px 16px',
        background: 'linear-gradient(to right, #0f766e, #0d9488)',
        marginTop:  0,
      }}>
        <div style={{
          maxWidth:       '1280px',
          margin:         '0 auto',
          display:        'flex',
          flexWrap:       'wrap',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            '24px',
        }}>
          <div>
            <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '800', margin: '0 0 8px' }}>
              Red Rural de Atención
            </h2>
            <p style={{ color: '#99f6e4', margin: 0, maxWidth: '480px' }}>
              3 Postas Rurales y 3 Estaciones Médicas cubren toda la comuna.
            </p>
          </div>
          <Link to="/postas-rurales" style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '8px',
            background:     'white',
            color:          '#0f766e',
            padding:        '12px 24px',
            borderRadius:   '12px',
            fontWeight:     '600',
            textDecoration: 'none',
            boxShadow:      '0 4px 14px rgba(0,0,0,0.15)',
            whiteSpace:     'nowrap',
          }}>
            <MapPin size={18} /> Ver red rural <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;