const { db } = require('../config/firebase');

// Agregar una bodega
const addBodega = async (req, res) => {
  try {
    const { nombre, ubicacion, empresa_id } = req.body;

    if (!nombre || !ubicacion || !empresa_id) {
      return res.status(400).json({ error: 'Faltan datos para la bodega.' });
    }

    // Crear una nueva bodega con el nombre, ubicación y empresa_id
    const newBodega = { nombre, ubicacion, empresa_id }; // Asegurarse de que el empresa_id esté incluido

    const bodegaRef = await db.collection('bodegas').add(newBodega);

    res.status(201).json({ id: bodegaRef.id, ...newBodega });
  } catch (error) {
    console.error('Error al agregar bodega:', error);
    res.status(500).json({ error: 'Error al agregar bodega.' });
  }
};

// Agregar producto a bodega
const addProductToBodega = async (req, res) => {
  try {
    const { productoId, bodegaId, cantidad, empresa_id } = req.body;

    // Validación de datos
    if (!productoId || !bodegaId || cantidad <= 0 || !empresa_id) {
      return res.status(400).json({ error: 'Faltan datos o cantidad inválida' });
    }

    // Verificamos si ya existe un registro para ese producto en esa bodega
    const inventarioRef = db.collection('inventario');
    const existingInventory = await inventarioRef
      .where('producto_id', '==', productoId)
      .where('bodega_id', '==', bodegaId)
      .where('empresa_id', '==', empresa_id)
      .get();

    if (!existingInventory.empty) {
      // Si ya existe, actualizamos la cantidad
      const inventoryDoc = existingInventory.docs[0];
      let existingCantidad = inventoryDoc.data().cantidad;
      existingCantidad = parseInt(existingCantidad, 10);  // Convertimos la cantidad existente a número

      // Asegúrate de que la nueva cantidad también es un número
      let newCantidad = parseInt(cantidad, 10);  // Convertimos la nueva cantidad a número

      const updatedCantidad = existingCantidad + newCantidad;  // Sumamos la cantidad

      // Actualizamos el documento de inventario con la nueva cantidad
      await inventoryDoc.ref.update({ cantidad: updatedCantidad });

      return res.status(200).json({ message: 'Cantidad actualizada en la bodega' });
    } else {
      // Si no existe, creamos un nuevo registro en inventario
      await inventarioRef.add({
        producto_id: productoId,
        bodega_id: bodegaId,
        cantidad: cantidad,  // En este caso, no necesitamos hacer parseInt ya que el valor ya es un número
        empresa_id,
      });
      return res.status(201).json({ message: 'Producto agregado a la bodega' });
    }
  } catch (error) {
    console.error('Error al agregar producto a bodega:', error);
    res.status(500).json({ error: 'Hubo un error al agregar producto a la bodega.' });
  }
};



// Obtener bodegas (con filtro de empresa)
const getBodegas = async (req, res) => {
  try {
    const empresa_id = req.query.empresa_id; // Obtener empresa_id desde los parámetros de la consulta
    
    // Si no se proporciona el empresa_id, devolver error
    if (!empresa_id) {
      return res.status(400).json({ error: 'Se requiere el ID de la empresa.' });
    }

    const bodegasRef = await db.collection('bodegas').where('empresa_id', '==', empresa_id).get(); // Filtrar por empresa_id
    
    if (bodegasRef.empty) {
      return res.status(404).json({ error: 'No se encontraron bodegas para esta empresa.' });
    }

    const bodegas = bodegasRef.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(bodegas);
  } catch (error) {
    console.error('Error al obtener las bodegas:', error);
    res.status(500).json({ error: 'Error al obtener las bodegas.' });
  }
};

module.exports = {
  addBodega,
  addProductToBodega,
  getBodegas,
};
