// controllers/authController.js
const { admin } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Registrar nuevo usuario
const registerUser = async (req, res) => {
  const { email, password, role, empresa_id } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Guardar el usuario en Firestore con rol y empresa
    const userRef = admin.firestore().collection('usuarios').doc(userRecord.uid);
    await userRef.set({
      email,
      role, 
      empresa_id,
    });

    return res.status(201).json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Iniciar sesión
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar el usuario con Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email);

    // Crear el JWT
    const token = jwt.sign(
      { uid: userRecord.uid },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Obtener el rol y la empresa asociada
    const userSnapshot = await admin.firestore().collection('usuarios').doc(userRecord.uid).get();
    const userData = userSnapshot.data();

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        email,
        role: userData.role,
        empresa_id: userData.empresa_id
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser };
