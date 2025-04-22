const { db } = require('../config/firebase');  // Usamos la instancia de Firestore de la configuración

// Función que actualiza el inventario de productos
const updateProductInventory = async (productos) => {
  try {
    await Promise.all(productos.map(async (producto) => {
      const productId = producto.id;
      const bodegasSeleccionadas = producto.bodegasSeleccionadas;

      await Promise.all(bodegasSeleccionadas.map(async (bodega) => {
        const { bodegaId, cantidadSeleccionada } = bodega;

        const inventarioSnapshot = await db.collection('inventario')
          .where('producto_id', '==', productId)
          .where('bodega_id', '==', bodegaId)
          .get();

        if (inventarioSnapshot.empty) {
          throw new Error(`No se encontró inventario para el producto ${productId} en la bodega ${bodegaId}`);
        }

        const inventarioDoc = inventarioSnapshot.docs[0];
        const cantidadDisponible = inventarioDoc.data().cantidad;

        if (cantidadDisponible == null) {
          throw new Error(`La cantidad de inventario para el producto ${productId} en la bodega ${bodegaId} es inválida.`);
        }

        const nuevaCantidad = cantidadDisponible - cantidadSeleccionada;

        if (nuevaCantidad < 0) {
          throw new Error(`No hay suficiente inventario en la bodega ${bodegaId}.`);
        }

        await db.collection('inventario').doc(inventarioDoc.id).update({
          cantidad: nuevaCantidad,
        });
      }));
    }));

    return { message: 'Inventario actualizado correctamente' };
  } catch (error) {
    console.error('Error al actualizar el inventario:', error);
    throw new Error('Hubo un error al actualizar el inventario.');
  }
};

// Función para obtener las cantidades de un producto en todas las bodegas
const getProductInventory = async (productoId, empresa_id) => {
  try {
    // Buscar las bodegas que tienen inventarios de este producto en la empresa
    const inventarioRef = db.collection('inventario');
    const inventarioSnapshot = await inventarioRef
      .where('producto_id', '==', productoId)
      .where('empresa_id', '==', empresa_id)
      .get();

    const bodegaInventarios = [];

    inventarioSnapshot.forEach(doc => {
      const data = doc.data();

      bodegaInventarios.push({
        bodegaId: data.bodega_id,
        cantidadDisponible: data.cantidad,  // Asegúrate de que esta propiedad sea un número
        bodegaNombre: data.bodega_nombre,  // Verifica que estos campos estén presentes
      });
    });

    return bodegaInventarios;
  } catch (error) {
    console.error('Error al obtener inventario del producto:', error);
    throw new Error('No se pudo obtener el inventario del producto.');
  }
};

module.exports = {  updateProductInventory, 
                    getProductInventory };
