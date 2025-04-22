// src/routes.js

const express = require('express');
const { getUsersByCompany, changeUserRole } = require('../controllers/userController');
const router = express.Router();

// Ruta para obtener los usuarios de una empresa
router.get('/users', getUsersByCompany);

// Ruta para cambiar el rol de un usuario
router.put('/users/:id', changeUserRole);

module.exports = router;
