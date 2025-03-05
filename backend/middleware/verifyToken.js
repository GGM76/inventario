// middleware/verifyToken.js

const admin = require('firebase-admin');

// Función middleware para verificar el token de autenticación
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;

  // Si no se envía un token
  if (!token) {
    return res.status(403).json({ error: 'No se proporcionó token de autenticación' });
  }

  try {
    // Eliminar "Bearer " del token (si es necesario)
    const idToken = token.replace('Bearer ', '');

    // Verificar el token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Si es válido, adjuntamos la información del usuario a la solicitud
    req.user = decodedToken;
    next(); // Continuamos con la siguiente función de middleware o la ruta
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).json({ error: 'Token no válido o expirado' });
  }
};

module.exports = verifyToken;
