const express = require('express');
const router = express.Router();
const { addSubproject, getSubprojectsByProjectId } = require('../controllers/subprojectController');
const { authenticateToken } = require('../Middleware/authMiddleware');

// Crear un subproyecto
router.post('/subprojects', authenticateToken, addSubproject);

// Obtener subproyectos por proyecto (ID del proyecto principal)
router.get('/subprojects/:projectId', authenticateToken, getSubprojectsByProjectId);

module.exports = router;
