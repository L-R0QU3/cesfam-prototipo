const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/claveUnicaController')

// GET /api/auth/claveunica/login?tipo=paciente
router.get('/login', controller.iniciarLogin)

// GET /api/auth/claveunica/callback
router.get('/callback', controller.callback)

module.exports = router