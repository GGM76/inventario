// src/redux/reducers/projectSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (empresaId, { rejectWithValue }) => {
    const token = localStorage.getItem('authToken'); // Obtener el token de localStorage

    if (!token) {
      return rejectWithValue('No se encontró el token de autenticación');
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/roomies/projects?empresa_id=${empresaId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Agregar el token en las cabeceras
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los proyectos');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default projectSlice.reducer;
