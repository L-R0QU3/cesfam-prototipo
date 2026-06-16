const express = require('express');
const router = express.Router();
const noticiasController = require('../controllers/noticiasController');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/uploadNoticias');

// Rutas públicas
router.get('/', noticiasController.getNoticias);
router.get('/:id', noticiasController.getNoticiaById);

// Rutas protegidas (admin) – ahora permite hasta 5 imágenes
router.post('/', authenticate, authorize('admin'), upload.array('imagenes', 5), noticiasController.createNoticia);
router.put('/:id', authenticate, authorize('admin'), upload.array('imagenes', 5), noticiasController.updateNoticia);
router.delete('/:id', authenticate, authorize('admin'), noticiasController.deleteNoticia);

module.exports = router;