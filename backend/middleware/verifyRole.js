// middleware/verifyRole.js

const admin = require('firebase-admin');
const db = admin.firestore();

// Función middleware para verificar el rol del usuario
const verifyRole = (role) => {
  return async (req, res, next) => {
    const { user } = req; // Información del usuario obtenida del middleware verifyToken

    // Obtener el rol del usuario desde Firestore
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userRole = userDoc.data().role;

      if (userRole !== role) {
        return res.status(403).json({ error: 'Acceso denegado. No tienes permisos suficientes' });
      }

      next(); // Si el rol es el adecuado, continuamos con la siguiente función
    } catch (error) {
      console.error('Error al verificar el rol:', error);
      res.status(500).json({ error: 'Error al verificar los permisos del usuario' });
    }
  };
};

module.exports = verifyRole;
