const admin = require('firebase-admin');
const db = require('../config'); // Conexión a Firebase

// Función para registrar un nuevo usuario
const registerUser = async (req, res) => {
  const { email, password, username, role } = req.body;

  try {
    
    // Crear un nuevo usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: req.body.email,
      password: req.body.password,
      displayName: username,
    });
    
    // Agregar información adicional en Firestore (usuario y roles)
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      email,
      username,
      role: role || 'user', // Por defecto, el rol será "user"
    });

    res.status(201).json({ message: "Usuario creado", user: userRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser };
