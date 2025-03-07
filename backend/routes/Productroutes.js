// routes/productosRoutes.js
const express = require('express');
const { getProductos, addProducto, updateProducto, deleteProducto,getProductoById } = require('../controllers/productcontroller');
const authenticateToken = require('../Middleware/authMiddleware');

const router = express.Router();

// Ruta para obtener productos de una empresa (requiere autenticación)
router.get('/productos/:empresa_id', authenticateToken, getProductos);

// Ruta para agregar un producto (solo Admin)
router.post('/productos', authenticateToken, addProducto);
//Ruta para actualizar 
router.post('/productos', authenticateToken, updateProducto);
//Ruta para eliminar
router.post('/productos', authenticateToken, deleteProducto);
//Ruta para buscar un solo producto
router.post('/productos', authenticateToken, getProductoById );

module.exports = router;
