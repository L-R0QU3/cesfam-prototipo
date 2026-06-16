import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const NoticiaDetalle = () => {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { dark } = useTheme();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        const res = await api.get(`/api/noticias/${id}`);
        if (res.data.success) {
          setNoticia(res.data.data);
        } else {
          setError('Noticia no encontrada');
        }
      } catch (err) {
        setError('Error al cargar la noticia');
      } finally {
        setLoading(false);
      }
    };
    fetchNoticia();
  }, [id]);

  const C = {
    page: dark ? '#0f172a' : '#f8fafc',
    card: dark ? '#1e293b' : '#ffffff',
    textP: dark ? '#f1f5f9' : '#111827',
    textS: dark ? '#94a3b8' : '#6b7280',
    border: dark ? '#334155' : '#e5e7eb',
    imagePlaceholder: dark ? '#1e293b' : '#f1f5f9',
    modalOverlay: 'rgba(0,0,0,0.9)',
  };

  if (loading) {
    return (
      <div style={{ background: C.page, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div style={{ background: C.page, minHeight: '100vh', padding: '48px 16px', textAlign: 'center' }}>
        <p style={{ color: C.textS }}>{error || 'Noticia no disponible'}</p>
        <Link to="/" style={{ color: '#2563eb', marginTop: '16px', display: 'inline-block' }}>← Volver al inicio</Link>
      </div>
    );
  }

  const imagenes = noticia.imagenes || [];
  const imagenPrincipal = imagenes.length > 0 ? imagenes[0] : null;

  const abrirModal = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  const siguienteImagen = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagenes.length);
  };

  const anteriorImagen = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  return (
    <main style={{ background: C.page, minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 16px' }}>
        {/* Botón volver */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: C.textS,
            textDecoration: 'none',
            marginBottom: '24px',
            fontSize: '14px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.textS)}
        >
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        {/* Imagen principal (grande, arriba) */}
        {imagenPrincipal && (
          <div
            style={{
              marginBottom: '32px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${C.border}`,
              background: C.imagePlaceholder,
              cursor: 'pointer',
            }}
            onClick={() => abrirModal(0)}
          >
            <img
              src={`${API_URL}${imagenPrincipal}`}
              alt={`Imagen principal de ${noticia.titulo}`}
              style={{
                width: '100%',
                maxHeight: '500px',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
        )}

        {/* Placeholder si no hay imagen principal */}
        {!imagenPrincipal && (
          <div
            style={{
              background: C.imagePlaceholder,
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '32px',
              border: `1px solid ${C.border}`,
            }}
          >
            <ImageIcon size={32} style={{ color: C.textS, marginBottom: '8px' }} />
            <p style={{ color: C.textS, fontSize: '14px' }}>Sin imagen principal</p>
          </div>
        )}

        {/* Título */}
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: '800',
            color: C.textP,
            marginBottom: '12px',
            lineHeight: 1.2,
          }}
        >
          {noticia.titulo}
        </h1>

        {/* Fecha */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
            color: C.textS,
            fontSize: '14px',
          }}
        >
          <Calendar size={16} />
          {new Date(noticia.created_at).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        {/* Contenido */}
        <div
          style={{
            fontSize: '16px',
            lineHeight: 1.7,
            color: C.textP,
            whiteSpace: 'pre-line',
            marginBottom: '40px',
          }}
        >
          {noticia.contenido}
        </div>

        {/* Galería de todas las imágenes (incluyendo la principal) */}
        {imagenes.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: C.textP,
                marginBottom: '16px',
                borderBottom: `2px solid ${C.border}`,
                paddingBottom: '8px',
              }}
            >
              📸 Galería de imágenes ({imagenes.length})
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {imagenes.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    background: C.imagePlaceholder,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `1px solid ${C.border}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onClick={() => abrirModal(idx)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <img
                    src={`${API_URL}${img}`}
                    alt={`Imagen ${idx + 1} de ${noticia.titulo}`}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categoría */}
        {noticia.categoria && (
          <div
            style={{
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <span
              style={{
                background: dark ? '#1e293b' : '#f1f5f9',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                color: C.textS,
              }}
            >
              📂 {noticia.categoria}
            </span>
          </div>
        )}
      </div>

      {/* Modal / Lightbox para expandir imágenes */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: C.modalOverlay,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backdropFilter: 'blur(8px)',
          }}
          onClick={cerrarModal}
        >
          <button
            onClick={cerrarModal}
            style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              zIndex: 1001,
            }}
          >
            <X size={32} />
          </button>

          {/* Botón anterior */}
          {imagenes.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                anteriorImagen();
              }}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 1001,
              }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Imagen ampliada */}
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${API_URL}${imagenes[currentImageIndex]}`}
              alt={`Imagen ${currentImageIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
          </div>

          {/* Botón siguiente */}
          {imagenes.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                siguienteImagen();
              }}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 1001,
              }}
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Contador de imágenes */}
          {imagenes.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                zIndex: 1001,
              }}
            >
              {currentImageIndex + 1} / {imagenes.length}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default NoticiaDetalle;