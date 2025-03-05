const express = require('express');
const { addProduct, allProduct, oneProduct, upProduct, delProduct } = require('../controllers/productController');
const router = express.Router();

// Ruta para agregar un producto
router.post('/productos',addProduct);

// Ruta para obtener todos los productos
router.get('/productos', allProduct);
  
// Ruta para obtener un producto específico por ID
router.get('/productos/:id',oneProduct);

// Ruta para actualizar un producto
router.put('/productos/:id',upProduct);

// Ruta para eliminar un producto
router.delete('/productos/:id', delProduct);
    
module.exports = router;
