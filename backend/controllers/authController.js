//controllers/authContoller.js
const { admin, db } = require('../config/firebase'); // Asegúrate de tener acceso a Firestore también

const registerUser = async (req, res) => { 
    const { email, password, role, empresa_id } = req.body;
    try {
        // Crear usuario en Firebase Authentication
        const user = await admin.auth().createUser({
            email,
            password,
        });

        // Almacenar información adicional en Firestore (role y company)
        await db.collection('users').doc(user.uid).set({
            email,
            role,
            empresa_id,
        });

        res.status(201).json({
            message: 'Usuario registrado con éxito',
            uid: user.uid,
        });
    } catch (error) {
        // Verifica si es un error por email ya registrado
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }
        // Otros errores
        res.status(400).json({ message: error.message });
    }
};

module.exports = { registerUser };
