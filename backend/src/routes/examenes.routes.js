const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/examenesController');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload   = require('../middleware/uploadExamenes');
const { verificarTokenPaciente } = require('../controllers/claveUnicaController');

// ── PÚBLICAS (pacientes) ──────────────────────────────────
router.post('/acceder',          ctrl.accederExamen);
router.get('/download/:id',      ctrl.descargarExamen);
router.get('/tipos',             ctrl.getTiposExamen);

// ── PROTEGIDAS (admin/profesional) ───────────────────────
router.post('/', authenticate, authorize('admin'), upload.single('archivo'), ctrl.subirExamen);
router.get('/', authenticate, authorize('admin'), ctrl.listarExamenesAdmin);
router.patch('/:id/regenerar', authenticate, authorize('admin'), ctrl.regenerarPassword);
router.delete('/:id', authenticate, authorize('admin'), ctrl.eliminarExamen);

// ── PARA PACIENTES AUTENTICADOS (email o ClaveÚnica) ──────
router.get('/mis-examenes', verificarTokenPaciente, ctrl.misExamenes);

module.exports = router;