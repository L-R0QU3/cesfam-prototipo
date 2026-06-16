const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { AppError } = require('../middleware/errorHandler');

// ── GET todas las postas (PÚBLICO) ────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { tipo } = req.query;

    let query = 'SELECT * FROM postas WHERE deleted_at IS NULL';
    const params = [];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }

    query += ' ORDER BY tipo, nombre';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error) {
    next(error);
  }
});

// ── GET posta por ID (PÚBLICO) ────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM postas WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (result.rows.length === 0) return next(new AppError('Posta no encontrada', 404));
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── GET calendario de rondas (PÚBLICO) ────────────────────
router.get('/rondas/calendario', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.*, p.nombre as posta_nombre, p.ubicacion
       FROM rondas_medicas r
       JOIN postas p ON r.posta_id = p.id
       WHERE r.activo = true
       ORDER BY r.dia_semana, r.hora_inicio`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// ── POST crear posta (ADMIN) ───────────────────────────────
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { nombre, tipo, ubicacion, coordenadas_lat, coordenadas_lng,
            horario_atencion, encargado, telefono } = req.body;

    const tiposValidos = ['posta', 'estacion'];
    if (!nombre || !tipo || !ubicacion) {
      return next(new AppError('Nombre, tipo y ubicación son requeridos', 400));
    }
    if (!tiposValidos.includes(tipo)) {
      return next(new AppError('Tipo inválido (posta o estacion)', 400));
    }

    const result = await db.query(
      `INSERT INTO postas
       (nombre, tipo, ubicacion, coordenadas_lat, coordenadas_lng,
        horario_atencion, encargado, telefono, activo, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,NOW()) RETURNING *`,
      [nombre, tipo, ubicacion, coordenadas_lat, coordenadas_lng,
       horario_atencion, encargado, telefono]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── PATCH actualizar solo el horario (ADMIN) ──────────────
router.patch('/:id/horario', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { horario_atencion } = req.body;
    if (!horario_atencion) return next(new AppError('Horario requerido', 400));

    const result = await db.query(
      'UPDATE postas SET horario_atencion = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [horario_atencion, req.params.id]
    );
    if (result.rows.length === 0) return next(new AppError('Posta no encontrada', 404));

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE posta (eliminar permanente)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM postas WHERE id = $1 RETURNING id, nombre',
      [req.params.id]
    )
    if (result.rows.length === 0)
      return next(new AppError('Posta no encontrada', 404))
    res.json({ success: true, message: `Posta "${result.rows[0].nombre}" eliminada` })
  } catch (error) {
    next(error)
  }
})

module.exports = router;