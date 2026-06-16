const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');
const { AppError } = require('../middleware/errorHandler');

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email y contraseña son requeridos', 400));
    }

    const result = await db.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Credenciales inválidas', 401));
    }

    const usuario = result.rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.hash_password);

    if (!passwordValida) {
      return next(new AppError('Credenciales inválidas', 401));
    }

    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d', algorithm: 'HS256' }
    );

    res.json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: req.user });
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
  // Con JWT stateless, el logout lo maneja el cliente borrando el token
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

module.exports = router;