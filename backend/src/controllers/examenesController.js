const { db, admin } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

const generarPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pw = '';
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
};

const normalizarRut = (rut) => rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim();

// SUBIR EXAMEN (admin)
exports.subirExamen = async (req, res, next) => {
  try {
    const { rut_paciente, nombre_paciente, tipo_examen_id, fecha_examen, observaciones, dias_vigencia = 30 } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Archivo PDF requerido' });
    if (!rut_paciente || !tipo_examen_id || !fecha_examen) return res.status(400).json({ success: false, message: 'RUT, tipo de examen y fecha son requeridos' });
    const rutNorm = normalizarRut(rut_paciente);
    // Buscar o crear paciente
    let pacienteSnapshot = await db.collection('pacientes').where('rut', '==', rutNorm).get();
    let pacienteDoc;
    if (pacienteSnapshot.empty) {
      if (!nombre_paciente) return res.status(400).json({ success: false, message: 'El paciente no existe. Proporciona su nombre para crearlo.' });
      const newPaciente = { rut: rutNorm, nombre: nombre_paciente, activo: true, created_at: admin.firestore.FieldValue.serverTimestamp() };
      const ref = await db.collection('pacientes').add(newPaciente);
      pacienteDoc = await ref.get();
    } else {
      pacienteDoc = pacienteSnapshot.docs[0];
    }
    const paciente = { id: pacienteDoc.id, ...pacienteDoc.data() };
    // Obtener tipo de examen desde la colección `tipos_examen`
    const tipoSnap = await db.collection('tipos_examen').doc(tipo_examen_id).get();
    if (!tipoSnap.exists) return res.status(400).json({ success: false, message: 'Tipo de examen inválido' });
    const tipo = tipoSnap.data();
    const passwordPlana = generarPassword();
    const passwordHash = await bcrypt.hash(passwordPlana, 10);
    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + parseInt(dias_vigencia));
    const archivoUrl = `/uploads/examenes/${req.file.filename}`;
    const newExamen = {
      paciente_id: paciente.id,
      tipo_examen_id,
      profesional_id: req.user.id, // asumiendo que el admin tiene id
      archivo_url: archivoUrl,
      archivo_nombre: req.file.originalname,
      fecha_examen,
      observaciones: observaciones || null,
      requiere_ayuno: tipo.requiere_ayuno,
      password_hash: passwordHash,
      password_expira: admin.firestore.Timestamp.fromDate(expiracion),
      descargas_count: 0,
      descargas_max: 20,
      activo: true,
      deleted_at: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('examenes').add(newExamen);
    const examenDoc = await docRef.get();
    logger.info(`Examen subido: ${tipo.nombre} para ${rutNorm}`);
    res.status(201).json({
      success: true, message: 'Examen subido exitosamente',
      data: {
        examen_id: examenDoc.id,
        paciente_nombre: paciente.nombre,
        paciente_rut: paciente.rut,
        tipo_examen: tipo.nombre,
        fecha_examen,
        password_temporal: passwordPlana,
        expira_en: `${dias_vigencia} días`,
        instrucciones: tipo.instrucciones,
      }
    });
  } catch (error) { logger.error('Error subiendo examen:', error); next(error); }
};

// ACCESO CON CONTRASEÑA DE EXAMEN (portal)
exports.accederExamen = async (req, res, next) => {
  try {
    const { rut, password } = req.body;
    if (!rut || !password) return res.status(400).json({ success: false, message: 'RUT y contraseña requeridos' });
    const rutNorm = normalizarRut(rut);
    const pacienteSnapshot = await db.collection('pacientes').where('rut', '==', rutNorm).where('activo', '==', true).get();
    if (pacienteSnapshot.empty) return res.status(401).json({ success: false, message: 'RUT no registrado en el sistema' });
    const paciente = { id: pacienteSnapshot.docs[0].id, ...pacienteSnapshot.docs[0].data() };
    const examenesSnapshot = await db.collection('examenes')
      .where('paciente_id', '==', paciente.id)
      .where('activo', '==', true)
      .where('deleted_at', '==', null)
      .get();
    if (examenesSnapshot.empty) return res.status(404).json({ success: false, message: 'No hay exámenes disponibles' });
    let examenesAutorizados = [];
    const now = new Date();
    for (const doc of examenesSnapshot.docs) {
      const ex = doc.data();
      const expira = ex.password_expira?.toDate ? ex.password_expira.toDate() : null;
      if ((!expira || expira > now) && ex.descargas_count < ex.descargas_max) {
        const match = await bcrypt.compare(password, ex.password_hash);
        if (match) {
          const tipoSnap = await db.collection('tipos_examen').doc(ex.tipo_examen_id).get();
          const tipo = tipoSnap.exists ? tipoSnap.data() : {};
          examenesAutorizados.push({
            id: doc.id,
            tipo: tipo.nombre,
            grupo: tipo.grupo,
            instrucciones: tipo.instrucciones,
            requiere_ayuno: tipo.requiere_ayuno,
            horas_ayuno: tipo.horas_ayuno,
            fecha_examen: ex.fecha_examen,
            observaciones: ex.observaciones,
            expira: ex.password_expira?.toDate ? ex.password_expira.toDate() : null,
            descargas_restantes: ex.descargas_max - ex.descargas_count,
          });
        }
      }
    }
    if (examenesAutorizados.length === 0) return res.status(401).json({ success: false, message: 'Contraseña incorrecta o expirada' });
    const token = jwt.sign(
      { sub: paciente.id, rut: paciente.rut, tipo: 'paciente' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ success: true, data: { token, paciente: { nombre: paciente.nombre, rut: paciente.rut }, examenes: examenesAutorizados } });
  } catch (error) { next(error); }
};

// DESCARGAR PDF
exports.descargarExamen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No autorizado' });
    let decoded;
    try { decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET); } catch { return res.status(401).json({ success: false, message: 'Token inválido o expirado' }); }
    const examenDoc = await db.collection('examenes').doc(id).get();
    if (!examenDoc.exists) return res.status(404).json({ success: false, message: 'Examen no encontrado' });
    const examen = examenDoc.data();
    if (examen.paciente_id !== decoded.sub) return res.status(403).json({ success: false, message: 'No autorizado' });
    const expira = examen.password_expira?.toDate ? examen.password_expira.toDate() : null;
    if (expira && expira < new Date()) return res.status(403).json({ success: false, message: 'El acceso a este examen ha expirado' });
    if (examen.descargas_count >= examen.descargas_max) return res.status(403).json({ success: false, message: 'Límite de descargas alcanzado' });
    const filePath = path.join(__dirname, '../../', examen.archivo_url);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Archivo no encontrado en el servidor' });
    await db.collection('examenes').doc(id).update({ descargas_count: admin.firestore.FieldValue.increment(1) });
    await db.collection('log_descargas').add({
      examen_id: id,
      paciente_id: decoded.sub,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    const nombreDescarga = examen.archivo_nombre || `examen_${id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreDescarga}"`);
    res.sendFile(filePath);
  } catch (error) { next(error); }
};

// LISTAR EXÁMENES ADMIN (con filtro por RUT)
exports.listarExamenesAdmin = async (req, res, next) => {
  try {
    const { rut, tipo, page = 1, limit = 20 } = req.query;
    let query = db.collection('examenes').where('deleted_at', '==', null);
    if (rut) {
      const rutNorm = normalizarRut(rut);
      const pacienteSnap = await db.collection('pacientes').where('rut', '==', rutNorm).get();
      if (!pacienteSnap.empty) query = query.where('paciente_id', '==', pacienteSnap.docs[0].id);
      else return res.json({ success: true, data: [], total: 0 });
    }
    if (tipo) query = query.where('tipo_examen_id', '==', tipo);
    const snapshot = await query.orderBy('created_at', 'desc').get();
    let examenes = [];
    for (const doc of snapshot.docs) {
      const ex = doc.data();
      const pacienteSnap = await db.collection('pacientes').doc(ex.paciente_id).get();
      const paciente = pacienteSnap.exists ? pacienteSnap.data() : {};
      const tipoSnap = await db.collection('tipos_examen').doc(ex.tipo_examen_id).get();
      const tipoExam = tipoSnap.exists ? tipoSnap.data() : {};
      examenes.push({
        id: doc.id,
        ...ex,
        rut: paciente.rut,
        paciente_nombre: paciente.nombre,
        tipo_nombre: tipoExam.nombre,
        grupo: tipoExam.grupo,
      });
    }
    const total = examenes.length;
    const paginated = examenes.slice((page-1)*limit, page*limit);
    res.json({ success: true, data: paginated, total });
  } catch (error) { next(error); }
};

// REGENERAR CONTRASEÑA
exports.regenerarPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dias_vigencia = 30 } = req.body;
    const passwordPlana = generarPassword();
    const passwordHash = await bcrypt.hash(passwordPlana, 10);
    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + parseInt(dias_vigencia));
    await db.collection('examenes').doc(id).update({
      password_hash: passwordHash,
      password_expira: admin.firestore.Timestamp.fromDate(expiracion),
      descargas_count: 0,
      descargas_max: 20,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, data: { nueva_password: passwordPlana, expira_en: `${dias_vigencia} días` } });
  } catch (error) { next(error); }
};

// ELIMINAR EXAMEN (soft delete)
exports.eliminarExamen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('examenes').doc(id);
    await docRef.update({ deleted_at: admin.firestore.FieldValue.serverTimestamp(), activo: false });
    res.json({ success: true, message: 'Examen eliminado' });
  } catch (error) { next(error); }
};

// OBTENER EXÁMENES DEL PACIENTE AUTENTICADO (para el portal)
exports.misExamenes = async (req, res, next) => {
  try {
    const pacienteId = req.paciente.sub;
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
        const tipoSnap = await db.collection('tipos_examen').doc(ex.tipo_examen_id).get();
        const tipo = tipoSnap.exists ? tipoSnap.data() : {};
        examenes.push({
          id: doc.id,
          tipo: tipo.nombre,
          grupo: tipo.grupo,
          instrucciones: tipo.instrucciones,
          requiere_ayuno: tipo.requiere_ayuno,
          horas_ayuno: tipo.horas_ayuno,
          fecha_examen: ex.fecha_examen,
          observaciones: ex.observaciones,
          password_expira: ex.password_expira,
          descargas_restantes: ex.descargas_max - ex.descargas_count,
        });
      }
    }
    examenes.sort((a, b) => new Date(b.fecha_examen) - new Date(a.fecha_examen));
    res.json({ success: true, data: examenes });
  } catch (error) { next(error); }
};

// TIPOS DE EXAMEN
exports.getTiposExamen = async (req, res, next) => {
  try {
    const snapshot = await db.collection('tipos_examen').where('activo', '==', true).orderBy('grupo').orderBy('nombre').get();
    const tipos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: tipos });
  } catch (error) { next(error); }
};