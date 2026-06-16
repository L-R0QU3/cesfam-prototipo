const express = require('express');
const router = express.Router();
const bannersController = require('../controllers/bannersController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Públicas
router.get('/activos', bannersController.getBannersActivos);

// Protegidas (admin)
router.get('/', authenticate, authorize('admin'), bannersController.getBanners);
router.post('/', authenticate, authorize('admin'), bannersController.createBanner);
router.put('/:id', authenticate, authorize('admin'), bannersController.updateBanner);
router.delete('/:id', authenticate, authorize('admin'), bannersController.deleteBanner);

module.exports = router;