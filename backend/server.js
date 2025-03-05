const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes'); // Importar las rutas de usuarios
const admin = require('firebase-admin');
const productRoutes = require('./routes/products');


const app = express();
const PORT = 5000;

// Middleware para procesar JSON
app.use(bodyParser.json());

// Usar las rutas de usuarios
app.use('/api/users', userRoutes);
app.use('/api', productRoutes); // Usamos las rutas de productos

// Ruta de prueba
app.get('/', (req, res) => {
  res.send("¡El servidor está funcionando!");
});

// Conectar al servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
