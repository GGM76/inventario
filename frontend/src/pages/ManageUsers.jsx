import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, updateUserRole } from '../redux/reducers/userSlice'; // Acción para obtener usuarios y actualizar roles

const ManageUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.users); // Obtener usuarios desde el estado

  const userCompany = localStorage.getItem('userEmpresaId'); // Obtener el ID de la empresa desde localStorage
  const [roles, setRoles] = useState({}); // Estado para almacenar los roles seleccionados de cada usuario
  
  useEffect(() => {
    if (userCompany) {
      // Llamamos a la acción para obtener los usuarios de la empresa
      dispatch(fetchUsers(userCompany)); // Se pasa el `empresa_id` al action
    }
  }, [userCompany, dispatch]);

  // Manejar el cambio de rol de un usuario
  const handleRoleChange = (userId, newRole) => {
    setRoles((prevRoles) => ({
      ...prevRoles,
      [userId]: newRole, // Actualizar el rol del usuario en el estado
    }));
  };

  // Manejar el botón "Salvar" que guarda los cambios y redirige al dashboard
  const handleSave = async () => {
    try {
      // Iterar sobre los usuarios y actualizar su rol
      for (const userId in roles) {
        const newRole = roles[userId];
        // Pasamos el `empresa_id` al actualizar el rol del usuario
        await dispatch(updateUserRole({ userId, role: newRole, empresa_id: userCompany }));
      }
      alert('Roles actualizados con éxito');
      navigate('/dashboard'); // Redirigir al dashboard después de salvar
    } catch (error) {
      alert('Hubo un error al actualizar los roles');
    }
  };

  return (
    <div>
      <h1>Administrar Usuarios</h1>

      {/* Mostrar mensaje de error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Mostrar usuarios si hay productos */}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p>No hay usuarios en esta empresa.</p>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>
                    {/* Menú desplegable para seleccionar el rol */}
                    <select
                      value={roles[user.id] || user.role} // Si hay un rol seleccionado, usarlo, sino mostrar el rol actual
                      onChange={(e) => handleRoleChange(user.id, e.target.value)} // Actualizar el rol en el estado
                    >
                      <option value="usuario">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSave} style={{ marginTop: '20px' }}>
            Salvar
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
