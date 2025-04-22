// src/redux/reducers/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Acción para iniciar sesión
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    try {
      // Realiza la solicitud de login al servidor (reemplazar la URL con tu endpoint real)
      const response = await axios.post('/roomies/login', { email, password });
      // La respuesta contiene el token y la información del usuario
      return response.data; // { token, userInfo }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }
);

// Acción para cerrar sesión
export const logout = createAsyncThunk('auth/logout', () => {
  localStorage.removeItem('authToken'); // Elimina el token del localStorage
  return {}; // Limpiar el estado de auth
});

// Estado inicial
const initialState = {
  token: localStorage.getItem('authToken') || null, // Si el token está en el localStorage, lo cargamos
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || null, // Almacenar datos del usuario
  loading: false,
  error: null,
};

// Slice de autenticación
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Acción para limpiar errores
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Manejo de login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true; // Indicar que estamos cargando
        state.error = null; // Limpiar cualquier error previo
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token; // Guardar el token
        state.userInfo = action.payload.userInfo; // Guardar los datos del usuario
        localStorage.setItem('authToken', action.payload.token); // Guardar el token en localStorage
        localStorage.setItem('userInfo', JSON.stringify(action.payload.userInfo)); // Guardar datos de usuario en localStorage
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; // Si ocurre un error, lo guardamos en el estado
      });

    // Manejo de logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.token = null; // Limpiar el token
        state.userInfo = null; // Limpiar la información del usuario
      });
  },
});

// Exportamos la acción clearError
export const { clearError } = authSlice.actions;

export default authSlice.reducer;
