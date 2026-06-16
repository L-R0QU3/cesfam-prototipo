const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// ── GET todos los programas (PÚBLICO) ─────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { categoria, activo } = req.query;

    let query = 'SELECT * FROM programas WHERE deleted_at IS NULL';
    const params = [];

    if (categoria) {
      params.push(categoria);
      query += ` AND categoria = $${params.length}`;
    }

    if (activo !== undefined) {
      params.push(activo === 'true');
      query += ` AND activo = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error) {
    next(error);
  }
});

// ── GET programa por ID (PÚBLICO) ─────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM programas WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Programa no encontrado', 404));
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── POST crear programa (ADMIN) ────────────────────────────
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { nombre, categoria, descripcion, objetivo, beneficiarios, horario_atencion } = req.body;

    const categoriasValidas = ['infantil', 'mujer', 'cardiovascular', 'salud_mental'];
    if (!nombre || !categoria) {
      return next(new AppError('Nombre y categoría son requeridos', 400));
    }
    if (!categoriasValidas.includes(categoria)) {
      return next(new AppError('Categoría inválida', 400));
    }

    const result = await db.query(
      `INSERT INTO programas
       (nombre, categoria, descripcion, objetivo, beneficiarios, horario_atencion, activo, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING *`,
      [nombre, categoria, descripcion, objetivo, beneficiarios, horario_atencion]
    );

    logger.info(`Programa creado: ${nombre}`);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── PUT actualizar programa (ADMIN) ───────────────────────
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { nombre, categoria, descripcion, objetivo, beneficiarios, horario_atencion, activo } = req.body;

    const check = await db.query(
      'SELECT id FROM programas WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (check.rows.length === 0) return next(new AppError('Programa no encontrado', 404));

    const result = await db.query(
      `UPDATE programas SET
        nombre = COALESCE($1, nombre),
        categoria = COALESCE($2, categoria),
        descripcion = COALESCE($3, descripcion),
        objetivo = COALESCE($4, objetivo),
        beneficiarios = COALESCE($5, beneficiarios),
        horario_atencion = COALESCE($6, horario_atencion),
        activo = COALESCE($7, activo),
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [nombre, categoria, descripcion, objetivo, beneficiarios, horario_atencion, activo, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── DELETE programa (ADMIN - soft delete) ─────────────────
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const result = await db.query(
      'UPDATE programas SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) return next(new AppError('Programa no encontrado', 404));

    res.json({ success: true, message: 'Programa eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;