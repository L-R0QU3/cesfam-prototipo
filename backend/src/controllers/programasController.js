// backend/src/controllers/programasController.js
const { db, admin } = require('../config/firebase');
const cloudinary = require('../services/cloudinary');
const { AppError } = require('../utils/errors');
const logger = require('../config/logger');

// ========== OBTENER TODOS LOS PROGRAMAS ==========
exports.getAllProgramas = async (req, res, next) => {
  try {
    const { categoria, activo, page = 1, limit = 10 } = req.query;
    let query = db.collection('programas')
      .where('deleted_at', '==', null);

    if (categoria) {
      query = query.where('categoria', '==', categoria);
    }

    if (activo !== undefined) {
      query = query.where('activo', '==', (activo === 'true'));
    }

    // Ordenar por fecha de creación descendente (usar el timestamp del documento o un campo 'created_at')
    query = query.orderBy('created_at', 'desc');

    // Paginación (limit y offset)
    const startAt = (page - 1) * limit;
    let paginatedQuery = query.limit(parseInt(limit));
    if (startAt > 0) {
      // Para offset, necesitamos obtener los documentos anteriores y usar startAfter
      // Nota: Firestore no soporta offset directamente; esta es una aproximación.
      // Para simplificar, omitiremos offset por ahora o lo implementaremos con startAfter.
      // Si necesitas offset exacto, recomiendo usar un campo secuencial o paginación con cursor.
      // Por simplicidad, esta versión usa limit sin offset. Si se necesita offset, hay que usar startAfter.
    }

    const snapshot = await paginatedQuery.get();
    const programas = [];
    snapshot.forEach(doc => {
      programas.push({ id: doc.id, ...doc.data() });
    });

    // Obtener total de documentos para paginación (sin limit)
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    res.status(200).json({
      success: true,
      data: programas,
      total,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error al obtener programas:', error);
    next(error);
  }
};

// ========== OBTENER PROGRAMA POR ID ==========
exports.getProgramaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('programas').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || (doc.data()?.deleted_at !== null && doc.data()?.deleted_at !== undefined)) {
      return next(new AppError('Programa no encontrado', 404));
    }
    const programa = { id: doc.id, ...doc.data() };
    res.status(200).json({
      success: true,
      data: programa,
    });
  } catch (error) {
    logger.error('Error al obtener programa:', error);
    next(error);
  }
};

// ========== CREAR NUEVO PROGRAMA ==========
exports.createPrograma = async (req, res, next) => {
  try {
    const { nombre, categoria, descripcion, objetivo, beneficiarios, horario_atencion } = req.body;
    let imagen_url = null;

    if (!nombre || !categoria) {
      return next(new AppError('Nombre y categoría son requeridos', 400));
    }

    const categoriasValidas = ['infantil', 'mujer', 'cardiovascular', 'salud_mental'];
    if (!categoriasValidas.includes(categoria)) {
      return next(new AppError('Categoría inválida', 400));
    }

    // Subir imagen a Cloudinary si existe
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'cesfam/programas',
          resource_type: 'auto',
        });
        imagen_url = result.secure_url;
      } catch (uploadError) {
        logger.error('Error al subir imagen:', uploadError);
        return next(new AppError('Error al procesar la imagen', 500));
      }
    }

    const newPrograma = {
      nombre,
      categoria,
      descripcion: descripcion || null,
      objetivo: objetivo || null,
      beneficiarios: beneficiarios || null,
      horario_atencion: horario_atencion || null,
      imagen_url,
      activo: true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      deleted_at: null,
    };

    const docRef = await db.collection('programas').add(newPrograma);
    const doc = await docRef.get();

    logger.info(`Programa creado: ${nombre} (ID: ${doc.id})`);

    res.status(201).json({
      success: true,
      message: 'Programa creado exitosamente',
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    logger.error('Error al crear programa:', error);
    next(error);
  }
};

// ========== ACTUALIZAR PROGRAMA ==========
exports.updatePrograma = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = {};
    const allowedFields = ['nombre', 'categoria', 'descripcion', 'objetivo', 'beneficiarios', 'horario_atencion', 'activo'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Si se sube una nueva imagen, procesarla
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'cesfam/programas',
          resource_type: 'auto',
        });
        updateData.imagen_url = result.secure_url;
      } catch (uploadError) {
        logger.error('Error al subir imagen:', uploadError);
        return next(new AppError('Error al procesar la imagen', 500));
      }
    }

    if (Object.keys(updateData).length === 0) {
      return next(new AppError('No hay campos para actualizar', 400));
    }

    updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

    const docRef = db.collection('programas').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || (doc.data()?.deleted_at !== null && doc.data()?.deleted_at !== undefined)) {
      return next(new AppError('Programa no encontrado', 404));
    }

    await docRef.update(updateData);
    const updatedDoc = await docRef.get();

    logger.info(`Programa actualizado: ID ${id}`);

    res.status(200).json({
      success: true,
      message: 'Programa actualizado exitosamente',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    logger.error('Error al actualizar programa:', error);
    next(error);
  }
};

// ========== ELIMINAR PROGRAMA (Soft Delete) ==========
exports.deletePrograma = async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('programas').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || (doc.data()?.deleted_at !== null && doc.data()?.deleted_at !== undefined)) {
      return next(new AppError('Programa no encontrado', 404));
    }
    await docRef.update({ deleted_at: admin.firestore.FieldValue.serverTimestamp() });
    logger.info(`Programa eliminado: ID ${id}`);
    res.status(200).json({
      success: true,
      message: 'Programa eliminado exitosamente',
    });
  } catch (error) {
    logger.error('Error al eliminar programa:', error);
    next(error);
  }
};

// ========== OBTENER ESTADÍSTICAS POR CATEGORÍA ==========
exports.getEstadisticas = async (req, res, next) => {
  try {
    const snapshot = await db.collection('programas')
      .where('deleted_at', '==', null)
      .get();

    const statsMap = new Map();
    snapshot.forEach(doc => {
      const cat = doc.data().categoria;
      if (!statsMap.has(cat)) {
        statsMap.set(cat, { total: 0, activos: 0 });
      }
      const stat = statsMap.get(cat);
      stat.total += 1;
      if (doc.data().activo === true) stat.activos += 1;
    });

    const data = Array.from(statsMap.entries()).map(([categoria, values]) => ({
      categoria,
      total: values.total,
      activos: values.activos,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas:', error);
    next(error);
  }
};