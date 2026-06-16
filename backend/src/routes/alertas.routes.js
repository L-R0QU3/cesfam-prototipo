const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Ruta pública (activas)
router.get('/activas', alertasController.getAlertasActivas);

// Rutas protegidas (admin)
router.get('/', authenticate, authorize('admin'), alertasController.getAlertas);
router.post('/', authenticate, authorize('admin'), alertasController.createAlerta);
router.put('/:id', authenticate, authorize('admin'), alertasController.updateAlerta);
router.delete('/:id', authenticate, authorize('admin'), alertasController.deleteAlerta);

module.exports = router;