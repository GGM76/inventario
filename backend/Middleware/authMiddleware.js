const { admin } = require('../config/firebase');  // Accede correctamente a `admin`

const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  console.log('Firebase initialized for:', serviceAccount.project_id);
  console.log('Token recibido:', token);

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  try {
    // Verificar token
    const decodedToken = await admin.auth().verifyIdToken(token);  
    //console.log('Token verificado:', decodedToken);

    // Buscar el usuario en Firestore para obtener rol y empresa
    const userRef = admin.firestore().collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const userData = userDoc.data();
    req.user = { ...decodedToken, role: userData.role, empresa: userData.empresa_id }; 
    next();  // Continuar a la siguiente función (controlador)
  } catch (error) {
    console.error('Error verificando el token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta.' });
  }
  next();  // Si es admin, continuar con la siguiente función
};

module.exports = { checkAdmin, authenticateToken };
