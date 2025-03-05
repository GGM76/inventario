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
app.use('/roomies/users', userRoutes);
app.use('/roomies', productRoutes); // Usamos las rutas de productos

// Ruta de prueba
app.get('/', (req, res) => {
  res.send("¡El servidor está funcionando!");
});
app.get('/roomies/home', (req, res) => {
  res.send("Estas en la pagina de home");
});
app.get('/roomies/dashboard', (req, res) => {
  res.send("Estas en la pagina de dashboard");
});
// Conectar al servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
