//server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/Productroutes');
const bodegaRoutes = require('./routes/bodegaRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const subprojectRoutes = require('./routes/subprojectRoutes');

const app = express();

app.use(cors());
app.use(express.json());    

app.use('/roomies/', authRoutes);
app.use('/roomies/', productRoutes);
app.use('/roomies/', bodegaRoutes);
app.use('/roomies/', userRoutes);
app.use('/roomies/', projectRoutes);
app.use('/roomies/', subprojectRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
