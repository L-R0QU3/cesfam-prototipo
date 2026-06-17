// backend/api.js
console.log('🚀 Cargando api.js...');
try {
  const app = require('./src/app');
  console.log('✅ app exportada correctamente');
  console.log('📌 typeof app:', typeof app);
  console.log('📌 app es función?', typeof app === 'function');
  console.log('📌 app:', app);

  module.exports = (req, res) => {
    console.log('📩 Solicitud recibida:', req.method, req.url);
    if (typeof app === 'function') {
      return app(req, res);
    } else {
      console.error('❌ app no es una función:', typeof app);
      res.status(500).json({ error: 'Internal Server Error - app no es una función' });
    }
  };
} catch (error) {
  console.error('❌ Error al cargar app:', error.message);
  module.exports = (req, res) => {
    res.status(500).json({ error: 'Error al cargar la aplicación: ' + error.message });
  };
}