// backend/api.js
console.log('Cargando api.js...');
const app = require('./src/app');
console.log('app exportada correctamente');

// Exportar como función para mayor compatibilidad con Vercel
module.exports = (req, res) => {
  return app(req, res);
};