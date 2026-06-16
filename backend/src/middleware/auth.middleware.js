const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../config/logger');

// ── VERIFICAR JWT PARA ADMINISTRADORES ─────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario aún existe y está activo
    const result = await db.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1 AND activo = true',
      [decoded.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    logger.error('Error de autenticación:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado, inicia sesión nuevamente',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }
};

// ── VERIFICAR ROL (ADMIN) ─────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para esta acción',
      });
    }

    next();
  };
};

// ── AUTENTICACIÓN PARA PACIENTES (PORTAL) ─────────────────
const authenticatePaciente = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== 'paciente') {
      return res.status(403).json({ success: false, message: 'Acceso no autorizado' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};

// ── EXPORTACIÓN ÚNICA (corregida) ────────────────────────
module.exports = { authenticate, authorize, authenticatePaciente };