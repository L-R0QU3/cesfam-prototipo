const { db, admin } = require('../config/firebase');
const logger = require('../config/logger');

// Obtener todos los banners (admin)
exports.getBanners = async (req, res, next) => {
  try {
    const snapshot = await db.collection('banners')
      .orderBy('orden', 'asc')
      .orderBy('created_at', 'desc')
      .get();
    const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: banners });
  } catch (error) {
    logger.error('Error al obtener banners:', error);
    next(error);
  }
};

// Obtener banners activos (frontend público)
exports.getBannersActivos = async (req, res, next) => {
  try {
    const snapshot = await db.collection('banners')
      .where('activo', '==', true)
      .orderBy('orden', 'asc')
      .orderBy('created_at', 'desc')
      .get();
    const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: banners });
  } catch (error) {
    logger.error('Error al obtener banners activos:', error);
    next(error);
  }
};

// Crear un banner
exports.createBanner = async (req, res, next) => {
  try {
    const { titulo, descripcion, imagen_url, enlace, orden, activo } = req.body;
    if (!titulo || !imagen_url) {
      return res.status(400).json({ success: false, message: 'Título e imagen son requeridos' });
    }
    const newBanner = {
      titulo,
      descripcion: descripcion || null,
      imagen_url,
      enlace: enlace || null,
      orden: orden || 0,
      activo: activo !== undefined ? activo : true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('banners').add(newBanner);
    const doc = await docRef.get();
    res.status(201).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    logger.error('Error al crear banner:', error);
    next(error);
  }
};

// Actualizar banner
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {};
    const allowed = ['titulo', 'descripcion', 'imagen_url', 'enlace', 'orden', 'activo'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    updates.updated_at = admin.firestore.FieldValue.serverTimestamp();
    const docRef = db.collection('banners').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Banner no encontrado' });
    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error) {
    logger.error('Error al actualizar banner:', error);
    next(error);
  }
};

// Eliminar banner
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('banners').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Banner no encontrado' });
    await docRef.delete();
    res.json({ success: true, message: 'Banner eliminado' });
  } catch (error) {
    logger.error('Error al eliminar banner:', error);
    next(error);
  }
};