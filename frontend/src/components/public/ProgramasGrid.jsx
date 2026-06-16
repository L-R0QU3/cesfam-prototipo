import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Clock, Users, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const FILTROS = [
  { value: null,            label: 'Todos' },
  { value: 'infantil',      label: '👶 Infantil' },
  { value: 'mujer',         label: '🌸 Mujer' },
  { value: 'cardiovascular',label: '❤️ Cardiovascular' },
  { value: 'salud_mental',  label: '🧠 Salud Mental' },
];

const PROGRAMAS_CONFIG = {
  infantil:      { color: 'from-emerald-400 to-teal-600', borderColor: 'border-emerald-300', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', emoji: '🍼', label: 'Infantil' },
  mujer:         { color: 'from-pink-400 to-rose-600',   borderColor: 'border-pink-300',   bgLight: 'bg-pink-50',    textColor: 'text-pink-700',    emoji: '🌸', label: 'Mujer' },
  cardiovascular: { color: 'from-orange-400 to-red-600',  borderColor: 'border-orange-300',  bgLight: 'bg-orange-50',  textColor: 'text-orange-700',  emoji: '❤️', label: 'Cardiovascular' },
  salud_mental:  { color: 'from-purple-400 to-indigo-600',borderColor: 'border-purple-300', bgLight: 'bg-purple-50',   textColor: 'text-purple-700',   emoji: '🧠', label: 'Salud Mental' },
};

/* ── Tarjeta individual (ahora con colores adaptables) ── */
const ProgramaCard = ({ programa, dark }) => {
  const cfg = PROGRAMAS_CONFIG[programa.categoria] || PROGRAMAS_CONFIG.infantil;
  const cardBg = dark ? '#1e293b' : '#ffffff';
  const textPrimary = dark ? '#f1f5f9' : '#111827';
  const textSecondary = dark ? '#94a3b8' : '#6b7280';
  const borderColor = dark ? '#334155' : '#f1f5f9';

  return (
    <article
      className={`group overflow-hidden flex flex-col rounded-2xl border-t-4 ${cfg.borderColor} hover:-translate-y-1 transition-all duration-300`}
      style={{ background: cardBg, border: `1px solid ${borderColor}` }}
    >
      <div className={`bg-gradient-to-r ${cfg.color} h-28 flex items-center justify-center rounded-t-2xl`}>
        <span className="text-5xl" role="img" aria-label={cfg.label}>{cfg.emoji}</span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bgLight} ${cfg.textColor} w-fit mb-3`}>
          {cfg.label}
        </span>

        <h3 className="text-lg font-bold mb-2 leading-snug" style={{ color: textPrimary }}>
          {programa.nombre}
        </h3>

        <p className="text-sm leading-relaxed flex-1 line-clamp-3" style={{ color: textSecondary }}>
          {programa.descripcion || 'Programa de atención especializada para la comunidad.'}
        </p>

        <div className="mt-4 space-y-2">
          {programa.beneficiarios && (
            <div className={`flex items-start gap-2 p-2.5 rounded-lg ${cfg.bgLight}`}>
              <Users size={14} className={`${cfg.textColor} mt-0.5 shrink-0`} />
              <p className="text-xs" style={{ color: textSecondary }}>{programa.beneficiarios}</p>
            </div>
          )}
          {programa.horario_atencion && (
            <div className={`flex items-start gap-2 p-2.5 rounded-lg ${cfg.bgLight}`}>
              <Clock size={14} className={`${cfg.textColor} mt-0.5 shrink-0`} />
              <p className="text-xs" style={{ color: textSecondary }}>{programa.horario_atencion}</p>
            </div>
          )}
        </div>

        <Link
          to={`/programas/${programa.id}`}
          className={`mt-5 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${cfg.color} flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
        >
          Más información <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
};

/* ── Skeleton (también adaptable) ── */
const SkeletonCard = ({ dark }) => {
  const bg = dark ? '#1e293b' : '#ffffff';
  const skeletonBg = dark ? '#334155' : '#f1f5f9';
  return (
    <div className="overflow-hidden rounded-2xl animate-pulse" style={{ background: bg, border: `1px solid ${skeletonBg}` }}>
      <div className="h-28 bg-gray-200" style={{ background: skeletonBg }} />
      <div className="p-5 space-y-3">
        <div className="h-4 rounded w-1/3" style={{ background: skeletonBg }} />
        <div className="h-5 rounded w-3/4" style={{ background: skeletonBg }} />
        <div className="h-3 rounded w-full" style={{ background: skeletonBg }} />
        <div className="h-3 rounded w-5/6" style={{ background: skeletonBg }} />
        <div className="h-9 rounded-xl mt-4" style={{ background: skeletonBg }} />
      </div>
    </div>
  );
};

/* ── Componente principal ── */
const ProgramasGrid = () => {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState(null);
  const { dark } = useTheme();

  const bgSection = dark ? '#0f172a' : '#f8fafc';
  const textPrimary = dark ? '#f1f5f9' : '#111827';
  const textSecondary = dark ? '#94a3b8' : '#6b7280';

  const cargarProgramas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filtro ? { categoria: filtro, activo: true } : { activo: true };
      const res = await api.get('/api/programas', { params });
      setProgramas(res.data.data || []);
    } catch {
      setError('No se pudieron cargar los programas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { cargarProgramas(); }, [cargarProgramas]);

  return (
    <section className="py-16" style={{ background: bgSection }} aria-label="Programas de Salud">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="section-title" style={{ color: textPrimary }}>
            Programas de <span className="text-blue-600">Salud</span>
          </h2>
          <p className="section-subtitle" style={{ color: textSecondary }}>
            Atención especializada para cada etapa de vida. Conoce los programas
            disponibles en el CESFAM Valle Mar.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filtrar programas">
          {FILTROS.map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => setFiltro(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${filtro === value
                  ? 'bg-blue-600 text-white shadow-md'
                  : dark
                    ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              aria-pressed={filtro === value}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button onClick={cargarProgramas} className="btn-primary w-fit mx-auto">
              <RefreshCw size={16} /> Reintentar
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} dark={dark} />)}
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && programas.length === 0 && (
          <div className="text-center py-16" style={{ color: textSecondary }}>
            <p className="text-5xl mb-4">🏥</p>
            <p className="text-lg">No hay programas en esta categoría.</p>
          </div>
        )}

        {/* Grid de programas */}
        {!loading && !error && programas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programas.map(p => <ProgramaCard key={p.id} programa={p} dark={dark} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProgramasGrid;