// backend/api.js
console.log('🚀 Cargando api.js...');
const app = require('./src/app');
console.log('✅ app exportada correctamente, tipo:', typeof app);
module.exports = app;