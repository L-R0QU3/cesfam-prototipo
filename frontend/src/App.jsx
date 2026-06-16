import { Routes, Route } from 'react-router-dom';
import usePageTracking from './hooks/usePageTracking';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Páginas públicas
import Home from './pages/Home';
import Programas from './pages/Programas';
import PostasRurales from './pages/PostasRurales';
import Transparencia from './pages/Transparencia';
import PortalExamenes from './pages/PortalExamenes';
import Contacto from './pages/Contacto';
import NoticiaDetalle from './pages/NoticiaDetalle'; // 👈 nueva importación

// Páginas admin
import LoginAdmin from './pages/admin/LoginAdmin';
import Dashboard from './pages/admin/Dashboard';
import AdminNoticias from './pages/admin/AdminNoticias';
import AdminAlertas from './pages/admin/AdminAlertas';
import AdminHorarios from './pages/admin/AdminHorarios';
import AdminPostas from './pages/admin/AdminPostas';
import AdminAnaliticas from './pages/admin/AdminAnaliticas';
import AdminBanners from './pages/admin/AdminBanners';
import AdminProgramas from './pages/admin/AdminProgramas';
import AdminExamenes from './pages/admin/AdminExamenes';

/* Layout con Navbar + Footer solo para rutas públicas */
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex-1">{children}</div>
    <Footer />
  </div>
);

const App = () => {
  usePageTracking();

  return (
    <Routes>
      {/* ── Rutas públicas ─────────────────────────────── */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/programas" element={<PublicLayout><Programas /></PublicLayout>} />
      <Route path="/postas-rurales" element={<PublicLayout><PostasRurales /></PublicLayout>} />
      <Route path="/transparencia" element={<PublicLayout><Transparencia /></PublicLayout>} />
      <Route path="/contacto" element={<PublicLayout><Contacto /></PublicLayout>} />
      <Route path="/examenes" element={<PublicLayout><PortalExamenes /></PublicLayout>} />
      <Route path="/noticias/:id" element={<PublicLayout><NoticiaDetalle /></PublicLayout>} /> {/* 👈 nueva ruta */}

      {/* ── Login admin (sin Navbar/Footer) ────────────── */}
      <Route path="/admin/login" element={<LoginAdmin />} />

      {/* ── Rutas protegidas admin ──────────────────────── */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/noticias" element={<ProtectedRoute><AdminNoticias /></ProtectedRoute>} />
      <Route path="/admin/alertas" element={<ProtectedRoute><AdminAlertas /></ProtectedRoute>} />
      <Route path="/admin/banners" element={<ProtectedRoute><AdminBanners /></ProtectedRoute>} />
      <Route path="/admin/horarios" element={<ProtectedRoute><AdminHorarios /></ProtectedRoute>} />
      <Route path="/admin/postas" element={<ProtectedRoute><AdminPostas /></ProtectedRoute>} />
      <Route path="/admin/analiticas" element={<ProtectedRoute><AdminAnaliticas /></ProtectedRoute>} />
      <Route path="/admin/programas" element={<ProtectedRoute><AdminProgramas /></ProtectedRoute>} />
      <Route path="/admin/examenes" element={<ProtectedRoute><AdminExamenes /></ProtectedRoute>} />

      {/* ── 404 ────────────────────────────────────────── */}
      <Route path="*" element={
        <PublicLayout>
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-6xl font-extrabold text-gray-200 mb-4">404</p>
            <p className="text-xl font-semibold text-gray-700 mb-2">Página no encontrada</p>
            <a href="/" className="mt-4 text-blue-600 hover:underline font-medium">
              ← Volver al inicio
            </a>
          </div>
        </PublicLayout>
      } />
    </Routes>
  );
};

export default App;