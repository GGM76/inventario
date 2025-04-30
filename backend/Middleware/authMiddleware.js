const { admin } = require('../config/firebase');  // Accede correctamente a `admin`

const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  console.log('Token recibido:', token);  // Log del token que llega

  if (!token) {
    console.log('No se proporcionó un token.');
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  try {
    // Verificar token
    console.log('Verificando token...');
    const decodedToken = await admin.auth().verifyIdToken(token);  
    console.log('Token verificado:', decodedToken);  // Log del token verificado

    // Buscar el usuario en Firestore para obtener rol y empresa
    console.log('Buscando usuario en Firestore con UID:', decodedToken.uid);
    const userRef = admin.firestore().collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('Usuario no encontrado en Firestore.');
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const userData = userDoc.data();
    console.log('Datos del usuario obtenidos:', userData);  // Log de los datos del usuario

    req.user = { ...decodedToken, role: userData.role, empresa: userData.empresa_id }; 
    next();  // Continuar a la siguiente función (controlador)
  } catch (error) {
    console.error('Error verificando el token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.log('El usuario no es administrador.');
    return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta.' });
  }
  next();  // Si es admin, continuar con la siguiente función
};

module.exports = { checkAdmin, authenticateToken };
