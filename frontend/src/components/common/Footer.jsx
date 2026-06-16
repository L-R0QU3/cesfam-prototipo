import { Link }                                    from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Heart }       from 'lucide-react'
import { useTheme }                                from '../../context/ThemeContext'

const Footer = () => {
  const { dark } = useTheme()

  return (
    <footer style={{
      background: '#1e3a5f',
      color:      'white',
      marginTop:  0,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin:   '0 auto',
        padding:  '48px 16px 40px',
        display:  'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap:      '40px',
      }}>

        {/* Columna 1: Info CESFAM */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '38px', height: '38px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '12px',
            }}>CV</div>
            <div style={{ lineHeight: 1.3 }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>CESFAM Valle Mar</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#93c5fd' }}>Navidad, O'Higgins</p>
            </div>
          </div>
          <p style={{ color: '#bfdbfe', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
            Otorgamos servicio integral a las familias de Navidad,
            respetando tradiciones y fomentando el autocuidado en
            nuestra comunidad rural.
          </p>
        </div>

        {/* Columna 2: Contacto */}
        <div>
          <h4 style={{ fontWeight: '600', marginBottom: '14px', fontSize: '14px', color: 'white' }}>
            Contacto
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { Icon: MapPin, text: 'Av. Principal 123, Navidad, O\'Higgins' },
              { Icon: Phone,  text: '+56 72 241 2345' },
              { Icon: Mail,   text: 'contacto@cesfamvallemar.cl' },
              { Icon: Clock,  text: 'Lun–Vie: 08:00 – 17:00' },
            ].map(({ Icon, text }) => (
              <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#bfdbfe' }}>
                <Icon size={14} style={{ color: '#93c5fd', marginTop: '2px', flexShrink: 0 }} />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Links rápidos */}
        <div>
          <h4 style={{ fontWeight: '600', marginBottom: '14px', fontSize: '14px', color: 'white' }}>
            Accesos rápidos
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['/programas',      'Programas de Salud'],
              ['/postas-rurales', 'Red Rural'          ],
              ['/transparencia',  'Transparencia'      ],
              ['/contacto',       'Contacto'           ],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} style={{
                  color: '#93c5fd', fontSize: '13px', textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#93c5fd'}>
                  → {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pie */}
      <div style={{
        borderTop:  '1px solid rgba(255,255,255,0.1)',
        padding:    '16px',
        textAlign:  'center',
        fontSize:   '12px',
        color:      '#64748b',
      }}>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
          © {new Date().getFullYear()} CESFAM Valle Mar · Municipalidad de Navidad · Hecho con
          <Heart size={12} style={{ color: '#f87171', fill: '#f87171' }} />
          para la comunidad
        </p>
      </div>
    </footer>
  )
}

export default Footer