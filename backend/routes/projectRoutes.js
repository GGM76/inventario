// src/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getProjects, 
    addProject, 
    updateProject, 
    deleteProject, 
    getProjectDetails, 
    addProductsToProject,   
    devolverProductosAlProyecto,
    addProductsToSubproject,
    usarProductosEnSubproyecto,
    usarProductosEnProyecto,
    getProjectUsageHistory } = require('../controllers/projectController');
const { authenticateToken, checkAdmin  } = require('../Middleware/authMiddleware'); // Importamos el middleware

// Usamos el middleware para autenticar las rutas de proyectos
router.get('/projects', getProjects);
router.get('/projects/:id', getProjectDetails);

router.post('/projects',authenticateToken, addProject);
router.put('/projects/:id', authenticateToken, updateProject);
router.put('/projects/:id/add-products', authenticateToken, checkAdmin, addProductsToProject);
router.delete('/projects/:id', authenticateToken, deleteProject);
router.put('/subprojects/:id/devolver-productos', authenticateToken, devolverProductosAlProyecto);
router.put('/subprojects/:id/add-products', authenticateToken, addProductsToSubproject);
router.put('/projects/:id/usar-productos', authenticateToken, usarProductosEnProyecto);
router.put('/subprojects/:id/usar-productos', authenticateToken, usarProductosEnSubproyecto);
router.get('/projects/:id/historial', getProjectUsageHistory);



module.exports = router;
