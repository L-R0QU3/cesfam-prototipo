import { Link }                             from 'react-router-dom'
import { ArrowRight, MapPin, Users, Heart } from 'lucide-react'
import { useTheme }                         from '../../context/ThemeContext'

const STATS = [
  { icon: Users, valor: '12,000+', label: 'Pacientes atendidos' },
  { icon: MapPin, valor: '6',       label: 'Postas rurales'     },
  { icon: Heart, valor: '4',        label: 'Programas activos'  },
]

const Hero = () => {
  const { dark } = useTheme()
  // Color que conecta con la sección siguiente
  const waveColor = dark ? '#0f172a' : '#f8fafc'

  return (
    <section className="relative overflow-hidden min-h-[600px] flex items-center">

      {/* Foto de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/cesfam.jpg')" }}
      />

      {/* Overlay degradado */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(30,58,95,0.92) 0%, rgba(37,99,235,0.80) 55%, rgba(37,99,235,0.60) 100%)'
        }}
      />

      {/* Círculos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
             style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full"
             style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-white w-full">
        <div className="max-w-3xl">

          {/* Badge horario */}
          <span
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
            style={{
              background:     'rgba(255,255,255,0.12)',
              border:         '1px solid rgba(255,255,255,0.25)',
              color:          '#bfdbfe',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            Atención abierta · Lunes a Viernes 08:00 – 17:00
          </span>

          {/* Título */}
          <h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
          >
            Tu salud, <br />
            <span style={{
              background:           'linear-gradient(135deg, #bfdbfe, #ffffff)',
              WebkitBackgroundClip: 'text',
              backgroundClip:       'text',
              color:                'transparent',
            }}>
              nuestra prioridad
            </span>
          </h1>

          {/* Descripción */}
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
            CESFAM Valle Mar ofrece atención médica integral, programas preventivos
            y una red de postas rurales para toda la comuna de Navidad.
          </p>

          {/* Botones */}
          <div className="flex flex-wrap gap-4">
            <Link
              to="/programas"
              className="inline-flex items-center gap-2 bg-white text-blue-700
                         font-semibold px-6 py-3 rounded-xl hover:bg-gray-100
                         transition-all shadow-lg hover:shadow-xl"
            >
              Conocer programas
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 bg-transparent border-2
                         border-white text-white font-semibold px-6 py-3 rounded-xl
                         hover:bg-white/10 transition-all"
            >
              Contactar
            </Link>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/20">
            {STATS.map(({ icon: Icon, valor, label }) => (
              <div key={label} className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Icon size={22} className="text-blue-200" />
                  <span className="text-2xl font-bold">{valor}</span>
                </div>
                <p className="text-sm text-blue-100 mt-1">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Ola decorativa — color dinámico según tema */}
      <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%' }}
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z"
            fill={waveColor}
          />
        </svg>
      </div>
    </section>
  )
}

export default Hero