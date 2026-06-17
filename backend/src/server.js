// backend/src/server.js
const app = require('./app');
const logger = require('./config/logger');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

// ── Solo iniciar el servidor en desarrollo ──────────────
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      // Verificar conexión a BD (solo en desarrollo)
      await db.query('SELECT NOW()');
      logger.info('✅ Base de datos conectada');

      app.listen(PORT, () => {
        logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        logger.info(`📋 Health check: http://localhost:${PORT}/api/health`);
        logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      logger.error('❌ Error al iniciar el servidor:', error.message);
      process.exit(1);
    }
  };

  startServer();
} else {
  // En producción (Vercel), no iniciamos el servidor,
  // solo logueamos que estamos en entorno serverless.
  logger.info('ℹ️ Entorno de producción (Vercel) - servidor no iniciado');
}

// Exportar app por si Vercel la necesita (aunque usa api.js)
module.exports = app;