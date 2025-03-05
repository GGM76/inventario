const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Ruta para agregar un producto
router.post('/productos', async (req, res) => {
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
});

// Ruta para obtener todos los productos
router.get('/productos', async (req, res) => {
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
  });
  
// Ruta para obtener un producto específico por ID
router.get('/productos/:id', async (req, res) => {
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
  });
  
// Ruta para actualizar un producto
router.put('/productos/:id', async (req, res) => {
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
  }); 

// Ruta para eliminar un producto
router.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const productRef = admin.firestore().collection('productos').doc(id);
  
      await productRef.delete();
  
      return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  });
    
module.exports = router;
