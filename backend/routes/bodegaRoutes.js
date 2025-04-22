// src/routes/bodegaRoutes.js
const express = require('express');
const { addBodega, addProductToBodega, getBodegas } = require('../controllers/bodegaController');
const { authenticateToken, checkAdmin } = require('../Middleware/authMiddleware');

const router = express.Router();

// Rutas para bodegas
router.post('/bodegas', authenticateToken, checkAdmin, addBodega);  // Crear bodega
router.post('/addProductToBodega', authenticateToken, addProductToBodega);  // Agregar producto a bodega
router.get('/bodegas', authenticateToken, getBodegas);  // Obtener bodegas

module.exports = router;
