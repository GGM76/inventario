import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Acción para obtener los usuarios
export const fetchUsers  = createAsyncThunk('users/fetchUsers', async (empresaId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/roomies/users?empresa_id=${empresaId}`, {  // Cambié 'empresa' por 'empresa_id'
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener los usuarios');
  }
  return response.json();  // Devuelve la lista de usuarios
});

// Acción para actualizar el rol de un usuario
export const updateUserRole = createAsyncThunk('users/updateUserRole', async ({ userId, role, empresa_id }) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/roomies/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({ role, empresa_id: empresa_id }),  // Cambié 'empresaId' a 'empresa_id' para que coincida con el backend
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el rol del usuario');
  }

  return { userId, role };  // Retorna el ID del usuario y el nuevo rol
});

// Slice de usuarios
const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],  // Asegúrate de que 'users' esté inicializado como un array vacío
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;  // Actualiza el estado con los usuarios obtenidos
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;  // Guarda el error si ocurre
      })
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = state.users.find(user => user.id === action.payload.userId);
        if (updatedUser) {
          updatedUser.role = action.payload.role;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
