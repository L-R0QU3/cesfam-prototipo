import { useState, useEffect } from 'react';
import api from '../../utils/api';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/api/banners/activos');
        setBanners(res.data.data || []);
      } catch (err) {
        console.error('Error cargando banners:', err);
      }
    };
    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="w-full py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 flex flex-col h-full"
            >
              {/* Imagen completa, sin recortes */}
              <div className="w-full bg-gray-100 dark:bg-gray-700 flex justify-center items-center p-4">
                <img
                  src={banner.imagen_url}
                  alt={banner.titulo}
                  className="max-h-48 w-auto object-contain"
                />
              </div>
              {/* Texto debajo de la imagen, con limitación de líneas */}
              <div className="p-6 text-center md:text-left flex flex-col flex-grow">
                <h3
                  className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mb-2 line-clamp-2"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {banner.titulo}
                </h3>
                {banner.descripcion && (
                  <p
                    className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-4 line-clamp-3"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {banner.descripcion}
                  </p>
                )}
                {banner.enlace && (
                  <a
                    href={banner.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-auto"
                  >
                    Más información →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;