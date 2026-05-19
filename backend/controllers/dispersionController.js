//controllers/dispersionController.js
const { db, admin } = require('../config/firebase');
const { 
  validateProjectInventory, 
  decrementProjectProducts,
  restoreProjectProducts 
} = require('../services/dispersionService');

// Crear una nueva dispersión (carga masiva de productos)
const createDispersion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { metadata, productos } = req.body;

    // Validar datos requeridos
    if (!metadata || !productos || productos.length === 0) {
      return res.status(400).json({ 
        error: 'Se requieren metadata y productos para crear una dispersión.' 
      });
    }

    // Validar que el proyecto existe
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    const projectData = projectDoc.data();

    // Procesar y validar productos
    const productosProcessados = [];
    for (const row of productos) {
      const rowProcessed = {
        ciudad: row.CIUDAD || '',
        contacto: row.CONTACTO || '',
        direccion: row.DIRECCION || '',
        paqueterias: row.PAQUETERIAS || '',
        guias: row.GUIAS || '',
        telefono: row.TELEFONO || '',
        demos: row.DEMOS || '',
        productosDispersos: {}
      };

      // Extraer datos de productos (columnas dinámicas)
      if (projectData.productos && projectData.productos.length > 0) {
        for (const producto of projectData.productos) {
          const cantidad = row[producto.nombre];
          if (cantidad !== undefined && cantidad !== null && cantidad !== '') {
            rowProcessed.productosDispersos[producto.id] = {
              nombre: producto.nombre,
              cantidad: Number(cantidad)
            };
          }
        }
      }

      productosProcessados.push(rowProcessed);
    }

    // VALIDAR cantidades disponibles en el proyecto
    const validationErrors = validateProjectInventory(projectData.productos, productosProcessados);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Error de validación en las cantidades del archivo.',
        advertencia: 'No se pudo procesar la dispersión porque hay inconsistencias:',
        detalles: validationErrors
      });
    }

    // DESCONTAR productos del proyecto
    try {
      await decrementProjectProducts(projectId, projectData.productos, productosProcessados);
    } catch (decrementError) {
      console.error('Error al descontar productos:', decrementError);
      return res.status(500).json({ 
        error: 'Error al procesar la dispersión.',
        advertencia: 'No se pudo completar el descuento de productos del proyecto.',
        details: decrementError.message 
      });
    }

    // Crear documento de dispersión
    const dispersionData = {
      proyecto_id: projectId,
      proyecto_nombre: projectData.nombre,
      metadata: {
        ejecutivoCuenta: metadata.ejecutivoCuenta,
        grouper: metadata.grouper,
        empresa: metadata.empresa,
        centroCostos: metadata.centroCostos,
        cotizacion: metadata.cotizacion,
        fechaSolicitud: metadata.fechaSolicitud
      },
      registros: productosProcessados,
      totalRegistros: productosProcessados.length,
      usuarioId: req.user?.id || null,
      usuarioCorreo: req.user?.email || null,
      fechaCreacion: new Date(),
      estado: 'completada'
    };

    // Guardar en Firestore
    const dispersionRef = await db.collection('dispersion').add(dispersionData);

    // Registrar en historial
    await db.collection('historial_dispersiones').add({
      dispersion_id: dispersionRef.id,
      proyecto_id: projectId,
      proyecto_nombre: projectData.nombre,
      accion: 'crear',
      totalRegistros: productosProcessados.length,
      metadata: metadata,
      usuario_id: req.user?.id || null,
      usuario_correo: req.user?.email || null,
      timestamp: new Date(),
      descripcion: `Carga masiva de ${productosProcessados.length} registros de dispersión - COMPLETADA`
    });

    res.status(201).json({ 
      message: 'Dispersión creada exitosamente y productos descontados del proyecto',
      dispersionId: dispersionRef.id,
      totalRegistros: productosProcessados.length
    });

  } catch (error) {
    console.error('Error al crear dispersión:', error);
    res.status(500).json({ 
      error: 'Hubo un error al procesar la carga masiva.',
      advertencia: 'No se pudo completar la dispersión. Por favor, intenta nuevamente.',
      details: error.message 
    });
  }
};

// Obtener dispersiones de un proyecto
const getDispersiones = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validar que el proyecto existe
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    // Obtener dispersiones del proyecto
    const dispersionesSnapshot = await db.collection('dispersion')
      .where('proyecto_id', '==', projectId)
      .orderBy('fechaCreacion', 'desc')
      .get();

    if (dispersionesSnapshot.empty) {
      return res.status(200).json({ 
        dispersiones: [],
        total: 0,
        message: 'No hay dispersiones registradas para este proyecto.'
      });
    }

    const dispersiones = dispersionesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate ? doc.data().fechaCreacion.toDate() : doc.data().fechaCreacion
    }));

    res.json({ 
      dispersiones,
      total: dispersiones.length
    });

  } catch (error) {
    console.error('Error al obtener dispersiones:', error);
    res.status(500).json({ 
      error: 'Error al obtener dispersiones.',
      details: error.message 
    });
  }
};

// Obtener detalles de una dispersión específica
const getDispersionDetails = async (req, res) => {
  try {
    const { dispersionId } = req.params;

    const dispersionDoc = await db.collection('dispersion').doc(dispersionId).get();
    if (!dispersionDoc.exists) {
      return res.status(404).json({ error: 'Dispersión no encontrada.' });
    }

    const dispersionData = dispersionDoc.data();

    res.json({
      id: dispersionDoc.id,
      ...dispersionData,
      fechaCreacion: dispersionData.fechaCreacion?.toDate ? dispersionData.fechaCreacion.toDate() : dispersionData.fechaCreacion
    });

  } catch (error) {
    console.error('Error al obtener detalles de dispersión:', error);
    res.status(500).json({ 
      error: 'Error al obtener detalles de la dispersión.',
      details: error.message 
    });
  }
};

// Obtener historial de dispersiones
const getDispersionHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    const historialSnapshot = await db.collection('historial_dispersiones')
      .where('proyecto_id', '==', projectId)
      .orderBy('timestamp', 'desc')
      .get();

    if (historialSnapshot.empty) {
      return res.status(200).json({ 
        historial: [],
        total: 0,
        message: 'No hay historial de dispersiones para este proyecto.'
      });
    }

    const historial = historialSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : doc.data().timestamp
    }));

    res.json({ 
      historial,
      total: historial.length
    });

  } catch (error) {
    console.error('Error al obtener historial de dispersiones:', error);
    res.status(500).json({ 
      error: 'Error al obtener historial de dispersiones.',
      details: error.message 
    });
  }
};

// Eliminar una dispersión
const deleteDispersion = async (req, res) => {
  try {
    const { dispersionId } = req.params;

    const dispersionDoc = await db.collection('dispersion').doc(dispersionId).get();
    if (!dispersionDoc.exists) {
      return res.status(404).json({ error: 'Dispersión no encontrada.' });
    }

    const dispersionData = dispersionDoc.data();

    // Si la dispersión fue completada, restaurar las cantidades en el proyecto
    if (dispersionData.estado === 'completada') {
      try {
        await restoreProjectProducts(dispersionData.proyecto_id, dispersionData.registros);
      } catch (restoreError) {
        console.error('Error al restaurar cantidades:', restoreError);
        // Continuar con la eliminación aunque haya error en la restauración
      }
    }

    // Eliminar la dispersión
    await db.collection('dispersion').doc(dispersionId).delete();

    // Registrar eliminación en historial
    await db.collection('historial_dispersiones').add({
      dispersion_id: dispersionId,
      proyecto_id: dispersionData.proyecto_id,
      proyecto_nombre: dispersionData.proyecto_nombre,
      accion: 'eliminar',
      usuario_id: req.user?.id || null,
      usuario_correo: req.user?.email || null,
      timestamp: new Date(),
      descripcion: `Dispersión eliminada (${dispersionData.totalRegistros} registros)${
        dispersionData.estado === 'completada' ? ' - Cantidades restauradas al proyecto' : ''
      }`
    });

    res.json({ 
      message: 'Dispersión eliminada correctamente.',
      detalles: dispersionData.estado === 'completada' ? 'Las cantidades han sido restauradas al proyecto.' : null
    });

  } catch (error) {
    console.error('Error al eliminar dispersión:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la dispersión.',
      details: error.message 
    });
  }
};

module.exports = {
  createDispersion,
  getDispersiones,
  getDispersionDetails,
  getDispersionHistory,
  deleteDispersion
};
