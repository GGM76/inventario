const { db, admin } = require('../config/firebase');

// Obtener todos los usuarios de una empresa
const getUsersByCompany = async (req, res) => {
  const empresaId = req.query.empresa_id;  // Obtener el empresa_id desde los parámetros de consulta
  if (!empresaId) {
    return res.status(400).json({ error: 'El parámetro "empresa_id" no está presente.' });
  }

  try {
    // Filtramos los usuarios por 'empresa_id'
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('empresa_id', '==', empresaId)  // Filtramos por 'empresa_id'
      .get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ error: 'No se encontraron usuarios para esta empresa.' });
    }

    // Mapeamos los documentos obtenidos a formato de usuario
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(users);  // Retornamos los usuarios encontrados
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Cambiar el rol de un usuario
const changeUserRole = async (req, res) => {
  const { id } = req.params;  // ID del usuario
  const { role, empresa_id } = req.body;  // Nuevo rol y el empresa_id de la empresa que solicita el cambio
  if (!role || !empresa_id) {
    return res.status(400).json({ error: 'El parámetro "role" o "empresa_id" no está presente.' });
  }

  try {
    // Verificamos si el usuario existe en la base de datos
    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(id)
      .get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userData = userSnapshot.data();

    // Verificar si el usuario pertenece a la empresa indicada en el parámetro "empresa_id"
    if (userData.empresa_id !== empresa_id) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar el rol de un usuario de otra empresa.' });
    }

    // Actualizar el rol del usuario
    await admin.firestore()
      .collection('users')
      .doc(id)
      .update({ role });

    res.json({ message: 'Rol de usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el rol:', error);
    res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
  }
};

module.exports = { getUsersByCompany, changeUserRole };
