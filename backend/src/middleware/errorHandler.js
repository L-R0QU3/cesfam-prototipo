const logger = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Errores de PostgreSQL
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Ya existe un registro con esos datos';
  }

  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referencia a un registro que no existe';
  }

  // En producción no exponer detalles del error
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    logger.error('Error no operacional:', err);
    message = 'Error interno del servidor';
  } else {
    logger.error(`${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler, AppError };