// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado. No se encontró el token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token
    req.user = decoded; // Si es válido, lo asignamos a la solicitud
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authenticateToken;
