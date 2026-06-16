const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { AppError } = require('../middleware/errorHandler');

// GET todos los horarios (PÚBLICO)
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM horarios WHERE activo = true ORDER BY nombre'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// PUT actualizar horario de un box (ADMIN)
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { lunes, martes, miercoles, jueves, viernes, descripcion } = req.body;

    const result = await db.query(
      `UPDATE horarios SET
        lunes = COALESCE($1, lunes),
        martes = COALESCE($2, martes),
        miercoles = COALESCE($3, miercoles),
        jueves = COALESCE($4, jueves),
        viernes = COALESCE($5, viernes),
        descripcion = COALESCE($6, descripcion),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [lunes, martes, miercoles, jueves, viernes, descripcion, req.params.id]
    );

    if (result.rows.length === 0) return next(new AppError('Horario no encontrado', 404));
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE horario
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM horarios WHERE id = $1 RETURNING id',
      [req.params.id]
    )
    if (result.rows.length === 0)
      return next(new AppError('Horario no encontrado', 404))
    res.json({ success: true, message: 'Horario eliminado' })
  } catch (error) {
    next(error)
  }
})

// POST crear horario
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { nombre, tipo, descripcion } = req.body
    if (!nombre) return next(new AppError('Nombre requerido', 400))
    const result = await db.query(
      'INSERT INTO horarios (nombre, tipo, descripcion, activo) VALUES ($1,$2,$3,true) RETURNING *',
      [nombre, tipo ?? 'box', descripcion ?? null]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

module.exports = router;