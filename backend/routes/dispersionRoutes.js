// routes/dispersionRoutes.js
const express = require('express');
const router = express.Router();
const {
  createDispersion,
  getDispersiones,
  getDispersionDetails,
  getDispersionHistory,
  deleteDispersion
} = require('../controllers/dispersionController');
const { authenticateToken } = require('../Middleware/authMiddleware');

// Crear una nueva dispersión (carga masiva)
router.post('/projects/:projectId/mass-use', authenticateToken, createDispersion);

// Obtener historial de dispersiones de un proyecto (DEBE IR ANTES que la otra ruta)
router.get('/projects/:projectId/dispersiones/historial', authenticateToken, getDispersionHistory);

// Obtener todas las dispersiones de un proyecto
router.get('/projects/:projectId/dispersiones', authenticateToken, getDispersiones);

// Obtener detalles de una dispersión específica
router.get('/dispersiones/:dispersionId', authenticateToken, getDispersionDetails);

// Eliminar una dispersión
router.delete('/dispersiones/:dispersionId', authenticateToken, deleteDispersion);

module.exports = router;
