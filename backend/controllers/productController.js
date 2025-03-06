// controllers/productosController.js
const { db } = require('../config/firebase');

// Obtener productos de una empresa
const getProductos = async (req, res) => {
  const { empresa_id } = req.params;

  try {
    const productosSnapshot = await db.collection('productos')
      .where('empresa_id', '==', empresa_id)
      .get();

    const productos = productosSnapshot.docs.map(doc => doc.data());
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Agregar producto
const addProducto = async (req, res) => {
  const { nombre, cantidad, precio, empresa_id } = req.body;

  try {
    await db.collection('productos').add({
      nombre,
      cantidad,
      precio,
      empresa_id,
      fecha_creacion: new Date(),
      ultima_actualizacion: new Date(),
    });

    res.status(201).json({ message: 'Producto agregado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
};

module.exports = { getProductos, addProducto };
