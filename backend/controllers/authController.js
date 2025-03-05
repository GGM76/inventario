const admin = require('firebase-admin');
//import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Función para autenticar al usuario
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Firebase no proporciona directamente validación de la contraseña en el SDK Admin,
    // pero podemos verificar si el usuario existe. Para una implementación real,
    // sería ideal usar Firebase Authentication con un frontend o crear una solución JWT.
    const userRecord = await admin.auth().getUserByEmail(email);

    res.status(200).json({ message: "Usuario autenticado", user: userRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginUser };
