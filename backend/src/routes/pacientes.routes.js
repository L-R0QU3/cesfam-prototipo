const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');
const { authenticate, authorize } = require('../middleware/auth.middleware'); // Importar correctamente

// Rutas públicas (registro y login)
router.post('/registro', pacientesController.registroPaciente);
router.post('/login', pacientesController.loginPaciente);

// Ruta protegida: obtener paciente por RUT (solo administradores)
router.get('/buscar/:rut', authenticate, authorize('admin'), pacientesController.buscarPorRut);

// Ruta protegida para pacientes (requiere token de paciente)
// Si tienes authenticatePaciente, úsala; si no, usa authenticate y ajusta la lógica
router.get('/mis-examenes', authenticate, pacientesController.misExamenes); // O usa authenticatePaciente si existe

module.exports = router;