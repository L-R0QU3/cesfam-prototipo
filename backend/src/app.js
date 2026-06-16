const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const corsMiddleware = require('./middleware/cors.middleware');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Rutas
const authRoutes = require('./routes/auth.routes');
const programasRoutes = require('./routes/programas.routes');
const postasRoutes = require('./routes/postas.routes');
const noticiasRoutes = require('./routes/noticias.routes');
const horariosRoutes = require('./routes/horarios.routes');
const alertasRoutes = require('./routes/alertas.routes');
const bannersRoutes = require('./routes/banners.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const examenesRoutes = require('./routes/examenes.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const claveUnicaRoutes = require('./routes/claveUnica.routes');

const app = express();

// ── Seguridad ──────────────────────────────────────────────
app.use(helmet());
app.use(corsMiddleware);

// ── Excepción CORP para que las imágenes se puedan cargar desde otro origen
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// ── Compresión y parsers ───────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Servir archivos estáticos (imágenes subidas) ──────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/examenes', express.static(path.join(__dirname, '../uploads/examenes')));

// ── Logging ────────────────────────────────────────────────
app.use(morgan('dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    proyecto: 'CESFAM Valle Mar',
    entorno: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Fijar charset UTF-8 en todas las respuestas JSON ────────
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// ── Rutas API (todas deben ir ANTES del 404) ────────────────
app.use('/api/auth', authRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/postas', postasRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/examenes', examenesRoutes);
app.use('/api/auth/claveunica', claveUnicaRoutes);

// ── 404 (solo si ninguna ruta coincidió) ────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
});

// ── Error Handler Global ───────────────────────────────────
app.use(errorHandler);

module.exports = app;