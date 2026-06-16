const { db, admin } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const validarRut = (rut) => {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (!/^[0-9]+[0-9K]$/.test(clean)) return false;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  return dvCalculado === dv;
};

// Registro
exports.registroPaciente = async (req, res, next) => {
  try {
    let { rut, email, nombre, telefono, password } = req.body;
    if (!rut || !email || !nombre || !password) {
      return res.status(400).json({ success: false, message: 'RUT, email, nombre y contraseña son requeridos' });
    }
    const rutNorm = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim();
    if (!validarRut(rutNorm)) return res.status(400).json({ success: false, message: 'RUT inválido' });
    
    // Verificar email no exista
    const emailQuery = await db.collection('pacientes').where('email', '==', email.toLowerCase()).get();
    if (!emailQuery.empty) return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    
    // Buscar paciente por RUT
    const rutQuery = await db.collection('pacientes').where('rut', '==', rutNorm).get();
    const passwordHash = await bcrypt.hash(password, 10);
    let pacienteDoc;
    if (rutQuery.empty) {
      const newPaciente = {
        rut: rutNorm,
        nombre,
        email: email.toLowerCase(),
        telefono: telefono || null,
        password_hash: passwordHash,
        registro_completo: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('pacientes').add(newPaciente);
      pacienteDoc = await docRef.get();
    } else {
      const doc = rutQuery.docs[0];
      await doc.ref.update({
        nombre,
        email: email.toLowerCase(),
        telefono: telefono || null,
        password_hash: passwordHash,
        registro_completo: true,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      pacienteDoc = await doc.ref.get();
    }
    const paciente = { id: pacienteDoc.id, ...pacienteDoc.data() };
    const token = jwt.sign(
      { sub: paciente.id, rut: paciente.rut, tipo: 'paciente' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ success: true, message: 'Registro exitoso', data: { token, paciente } });
  } catch (error) {
    logger.error('Error en registro de paciente:', error);
    next(error);
  }
};

// Login con email + contraseña
exports.loginPaciente = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
    const snapshot = await db.collection('pacientes').where('email', '==', email.toLowerCase()).where('registro_completo', '==', true).get();
    if (snapshot.empty) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    const pacienteDoc = snapshot.docs[0];
    const paciente = { id: pacienteDoc.id, ...pacienteDoc.data() };
    const valido = await bcrypt.compare(password, paciente.password_hash);
    if (!valido) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    const token = jwt.sign(
      { sub: paciente.id, rut: paciente.rut, tipo: 'paciente' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, data: { token, paciente } });
  } catch (error) { next(error); }
};

// Buscar por RUT (para autocompletar en admin)
exports.buscarPorRut = async (req, res, next) => {
  try {
    const { rut } = req.params;
    const rutNorm = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    const snapshot = await db.collection('pacientes').where('rut', '==', rutNorm).get();
    if (snapshot.empty) return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    const doc = snapshot.docs[0];
    const data = doc.data();
    res.json({ success: true, data: { id: doc.id, nombre: data.nombre, email: data.email, telefono: data.telefono } });
  } catch (error) { next(error); }
};

// Obtener exámenes del paciente autenticado (se usará desde el portal)
// Nota: este método usa el token de paciente (verificarTokenPaciente)
exports.misExamenes = async (req, res, next) => {
  try {
    const pacienteId = req.paciente.sub; // asumiendo que el token contiene sub = paciente.id
    const snapshot = await db.collection('examenes')
      .where('paciente_id', '==', pacienteId)
      .where('activo', '==', true)
      .where('deleted_at', '==', null)
      .get();
    const examenes = [];
    const now = new Date();
    for (const doc of snapshot.docs) {
      const ex = doc.data();
      const expira = ex.password_expira?.toDate ? ex.password_expira.toDate() : null;
      if ((!expira || expira > now) && ex.descargas_count < ex.descargas_max) {
        // Obtener tipo de examen desde otra colección? Suponiendo que guardamos tipo_nombre en el documento
        examenes.push({ id: doc.id, ...ex });
      }
    }
    // Ordenar por fecha_examen descendente
    examenes.sort((a, b) => new Date(b.fecha_examen) - new Date(a.fecha_examen));
    res.json({ success: true, data: examenes });
  } catch (error) { next(error); }
};