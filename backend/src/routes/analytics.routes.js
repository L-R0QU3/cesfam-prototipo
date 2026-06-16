const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/analyticsController')
const { authenticate, authorize } = require('../middleware/auth.middleware')

// ── PÚBLICO: registrar visita ─────────────────────────────
router.post('/visita', controller.registrarVisita)

// ── ADMIN: estadísticas ───────────────────────────────────
router.get('/kpis',     authenticate, authorize('admin'), controller.getKpis)
router.get('/resumen',  authenticate, authorize('admin'), controller.getResumen)
router.get('/por-mes',  authenticate, authorize('admin'), controller.getVisitasPorMes)
router.get('/paginas',  authenticate, authorize('admin'), controller.getPaginasPopulares)
router.get('/hoy',      authenticate, authorize('admin'), controller.getVisitasHoy)

module.exports = router