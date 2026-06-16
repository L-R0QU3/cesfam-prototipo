import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginAdmin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [mostrarPw, setMostrarPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message || 'Credenciales incorrectas');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>

      {/* Círculos decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10"
           style={{ background: 'white', transform: 'translate(-50%,-50%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
           style={{ background: 'white', transform: 'translate(50%,50%)' }} />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header azul */}
          <div className="px-8 py-8 text-white text-center"
               style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center
                            justify-center mx-auto mb-4 text-2xl font-bold">
              CV
            </div>
            <h1 className="text-2xl font-bold">Panel Administrativo</h1>
            <p className="text-blue-200 text-sm mt-1">CESFAM Valle Mar</p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              Iniciar sesión
            </h2>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200
                              text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                             text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="admin@cesfam.cl"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                             text-gray-400 pointer-events-none" />
                  <input
                    type={mostrarPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600 p-1"
                    aria-label={mostrarPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {mostrarPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white
                           transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                style={{ background: 'linear-gradient(to right, #1e3a5f, #2563eb)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                     rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : 'Ingresar'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              Acceso restringido · Solo personal autorizado
            </p>
          </div>
        </div>

        {/* Volver al sitio */}
        <div className="text-center mt-6">
          <a href="/" className="text-blue-200 text-sm hover:text-white transition-colors">
            ← Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;