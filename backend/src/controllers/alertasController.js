const { db, admin } = require('../config/firebase');
const logger = require('../config/logger');

// Obtener todas las alertas (admin)
exports.getAlertas = async (req, res, next) => {
  try {
    const snapshot = await db.collection('alertas')
      .orderBy('created_at', 'desc')
      .get();
    const alertas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: alertas });
  } catch (error) {
    logger.error('Error al obtener alertas:', error);
    next(error);
  }
};

// Obtener alertas activas (frontend público)
exports.getAlertasActivas = async (req, res, next) => {
  try {
    const now = new Date();
    const snapshot = await db.collection('alertas')
      .where('activo', '==', true)
      .get();
    const alertas = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const fechaFin = data.fecha_fin?.toDate ? data.fecha_fin.toDate() : null;
      if (!fechaFin || fechaFin > now) {
        alertas.push({ id: doc.id, ...data });
      }
    });
    alertas.sort((a, b) => (b.created_at?.toDate() || 0) - (a.created_at?.toDate() || 0));
    res.json({ success: true, data: alertas });
  } catch (error) {
    logger.error('Error al obtener alertas activas:', error);
    next(error);
  }
};

// Crear una alerta
exports.createAlerta = async (req, res, next) => {
  try {
    const { titulo, descripcion, fecha_inicio, fecha_fin, activo, icono } = req.body;
    if (!titulo || !descripcion) {
      return res.status(400).json({ success: false, message: 'Título y descripción son requeridos' });
    }
    const newAlerta = {
      titulo,
      descripcion,
      fecha_inicio: fecha_inicio ? admin.firestore.Timestamp.fromDate(new Date(fecha_inicio)) : admin.firestore.FieldValue.serverTimestamp(),
      fecha_fin: fecha_fin ? admin.firestore.Timestamp.fromDate(new Date(fecha_fin)) : null,
      activo: activo !== undefined ? activo : true,
      icono: icono || '⚠️',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('alertas').add(newAlerta);
    const doc = await docRef.get();
    res.status(201).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    logger.error('Error al crear alerta:', error);
    next(error);
  }
};

// Actualizar alerta
exports.updateAlerta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {};
    const allowed = ['titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'activo', 'icono'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'fecha_inicio' || field === 'fecha_fin') {
          updates[field] = req.body[field] ? admin.firestore.Timestamp.fromDate(new Date(req.body[field])) : null;
        } else {
          updates[field] = req.body[field];
        }
      }
    });
    updates.updated_at = admin.firestore.FieldValue.serverTimestamp();
    const docRef = db.collection('alertas').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error) {
    logger.error('Error al actualizar alerta:', error);
    next(error);
  }
};

// Eliminar alerta
exports.deleteAlerta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('alertas').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    await docRef.delete();
    res.json({ success: true, message: 'Alerta eliminada' });
  } catch (error) {
    logger.error('Error al eliminar alerta:', error);
    next(error);
  }
};