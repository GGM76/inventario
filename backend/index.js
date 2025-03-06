// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/Productroutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', authRoutes);         // Rutas de autenticación
app.use('/api', productosRoutes);    // Rutas de productos

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
