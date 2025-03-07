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

const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = await db.collection('productos').doc(id).get();
    if (!docRef.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ id: docRef.id, ...docRef.data() });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo el producto', error });
  }
};

const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, precio, empresa_id } = req.body;

  try {
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await docRef.update({
      nombre,
      cantidad,
      precio,
      empresa_id,
    });
    res.status(200).json({ id, nombre, cantidad, precio, empresa_id });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando el producto', error });
  }
};

const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await docRef.delete();
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando el producto', error });
  }
};


module.exports = { getProductos, 
  addProducto,
  updateProducto, 
  deleteProducto,
  getProductoById };
