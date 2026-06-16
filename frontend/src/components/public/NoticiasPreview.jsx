import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const NoticiasPreview = () => {
  const [noticias, setNoticias] = useState([]);
  const { dark } = useTheme();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await api.get('/api/noticias?limit=3&estado=publicada');
        setNoticias(res.data.data || []);
      } catch (err) { console.error(err); }
    };
    fetchNoticias();
  }, []);

  if (noticias.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="section-title" style={{ color: dark ? '#f1f5f9' : '#111827' }}>📰 Últimas noticias</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {noticias.map(noticia => (
          <div key={noticia.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1">
            {noticia.imagenes && noticia.imagenes.length > 0 && (
              <img src={`${API_URL}${noticia.imagenes[0]}`} alt={noticia.titulo} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{noticia.titulo}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-3">{noticia.contenido}</p>
              <Link to={`/noticias/${noticia.id}`} className="mt-4 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline">Leer más →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticiasPreview;