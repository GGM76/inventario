const db = require('../config');
const admin = require('firebase-admin');

const addProduct = async (req, res) => {
  const { name, category, clid, quantity } = req.body;
  if (!name || !category || !clid || !quantity) {
    return res.status(400).json({ error: 'Todos los campos son necesarios' });
  }

  try {
    const newProduct = {
      name,
      category,
      clid,
      quantity,
      createdAt: new Date(),
    };

    const productRef = await admin.firestore().collection('productos').add(newProduct);

    return res.status(201).json({
      message: 'Producto creado exitosamente',
      productId: productRef.id,
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    return res.status(500).json({ error: 'Error al crear el producto' });
  }
};

const allProduct = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('productos').get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
}
 
const oneProduct =async (req, res) => {
  const { id } = req.params;

  try {
    const productDoc = await admin.firestore().collection('productos').doc(id).get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json({ id: productDoc.id, ...productDoc.data() });
  } catch (error) {
    console.error('Error obteniendo el producto:', error);
    return res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

const upProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, clid, quantity } = req.body;

  if (!name || !category || !clid || !quantity) {
    return res.status(400).json({ error: 'Todos los campos son necesarios' });
  }

  try {
    const productRef = admin.firestore().collection('productos').doc(id);

    await productRef.update({
      name,
      category,
      clid,
      quantity,
    });

    return res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

const delProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const productRef = admin.firestore().collection('productos').doc(id);

    await productRef.delete();

    return res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return res.status(500).json({ error: 'Error al eliminar el producto' });
  }
}

module.exports = { 
  addProduct,
  allProduct,
  oneProduct,
  upProduct,
  delProduct
 };
