// routes/productosRoutes.js
const express = require('express');
const { getProductos, addProducto } = require('../controllers/productcontroller');
const authenticateToken = require('../Middleware/authMiddleware');

const router = express.Router();

// Ruta para obtener productos de una empresa (requiere autenticación)
router.get('/productos/:empresa_id', authenticateToken, getProductos);

// Ruta para agregar un producto (solo Admin)
router.post('/productos', authenticateToken, addProducto);

module.exports = router;
