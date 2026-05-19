const { db } = require('../config/firebase');

/**
 * Valida que haya suficientes cantidades en el proyecto para la dispersión
 * @param {Array} projectProducts - Productos disponibles en el proyecto
 * @param {Array} productosDispersos - Productos a dispersar (desde el archivo)
 * @returns {Array} Array de errores encontrados (vacío si todo está bien)
 */
const validateProjectInventory = (projectProducts, productosDispersos) => {
  const errors = [];

  // Crear un mapa de cantidades totales por producto
  const totalQuantitiesUsed = {};

  // Sumar todas las cantidades usadas por producto
  for (const row of productosDispersos) {
    for (const [productId, producto] of Object.entries(row.productosDispersos || {})) {
      totalQuantitiesUsed[productId] = (totalQuantitiesUsed[productId] || 0) + producto.cantidad;
    }
  }

  // Validar contra cantidades disponibles en el proyecto
  for (const [productId, totalUsed] of Object.entries(totalQuantitiesUsed)) {
    const projectProduct = projectProducts.find(p => p.id === productId);
    
    if (!projectProduct) {
      errors.push(`Producto con ID ${productId} no existe en el proyecto.`);
      continue;
    }

    const disponible = projectProduct.cantidadTotal || 0;
    
    if (totalUsed > disponible) {
      errors.push(
        `Error en producto "${projectProduct.nombre}": intenta usar ${totalUsed} unidades pero solo hay ${disponible} disponibles.`
      );
    }
  }

  return errors;
};

/**
 * Descuenta los productos del proyecto
 * @param {string} projectId - ID del proyecto
 * @param {Array} projectProducts - Productos del proyecto
 * @param {Array} productosDispersos - Productos a descontar
 * @throws {Error} Si hay error al actualizar
 */
const decrementProjectProducts = async (projectId, projectProducts, productosDispersos) => {
  try {
    // Calcular las cantidades totales a descontar por producto
    const totalQuantitiesUsed = {};

    for (const row of productosDispersos) {
      for (const [productId, producto] of Object.entries(row.productosDispersos || {})) {
        totalQuantitiesUsed[productId] = (totalQuantitiesUsed[productId] || 0) + producto.cantidad;
      }
    }

    // Actualizar las cantidades en el proyecto
    const updatedProducts = projectProducts.map(p => {
      const quantityUsed = totalQuantitiesUsed[p.id] || 0;
      return {
        ...p,
        cantidadTotal: p.cantidadTotal - quantityUsed,
        cantidadReservada: (p.cantidadReservada || 0) + quantityUsed // Registrar cantidad reservada
      };
    });

    // Guardar cambios en Firestore
    await db.collection('projects').doc(projectId).update({
      productos: updatedProducts
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Error al descontar productos del proyecto: ${error.message}`);
  }
};

/**
 * Restaura los productos al proyecto (cuando se elimina una dispersión)
 * @param {string} projectId - ID del proyecto
 * @param {Array} registros - Registros de dispersión a restaurar
 * @throws {Error} Si hay error al restaurar
 */
const restoreProjectProducts = async (projectId, registros) => {
  try {
    const projectDoc = await db.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      throw new Error('Proyecto no encontrado');
    }

    const projectData = projectDoc.data();
    
    // Calcular cantidades a restaurar
    const totalQuantitiesUsed = {};
    for (const row of registros || []) {
      for (const [productId, producto] of Object.entries(row.productosDispersos || {})) {
        totalQuantitiesUsed[productId] = (totalQuantitiesUsed[productId] || 0) + producto.cantidad;
      }
    }

    // Restaurar cantidades en el proyecto
    const updatedProducts = (projectData.productos || []).map(p => {
      const quantityRestored = totalQuantitiesUsed[p.id] || 0;
      return {
        ...p,
        cantidadTotal: (p.cantidadTotal || 0) + quantityRestored,
        cantidadReservada: Math.max(0, (p.cantidadReservada || 0) - quantityRestored)
      };
    });

    await db.collection('projects').doc(projectId).update({
      productos: updatedProducts
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Error al restaurar productos del proyecto: ${error.message}`);
  }
};

module.exports = {
  validateProjectInventory,
  decrementProjectProducts,
  restoreProjectProducts
};
