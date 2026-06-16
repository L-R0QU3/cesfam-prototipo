const app = require('./app');
const logger = require('./config/logger');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Verificar conexión a BD
    await db.query('SELECT NOW()');
    logger.info('✅ Base de datos conectada');

    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      logger.info(`📋 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    // 🔍 Imprime el error completo en consola
    console.error('❌ ERROR DETALLADO:', error);
    logger.error('❌ Error al iniciar el servidor:', error.stack || error.message);
    process.exit(1);
  }
};

startServer();