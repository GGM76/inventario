// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';  // Asegúrate de tener este reducer

const store = configureStore({
  reducer: {
    auth: authReducer,  // Reducer para manejar el estado de autenticación
  },
});

export default store;
