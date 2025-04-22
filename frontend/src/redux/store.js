// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './reducers/productSlice';
import authReducer from './reducers/authSlice';
import userReducer from './reducers/userSlice';
import projectReducer from './reducers/projectSlice';

export const store = configureStore({
  reducer: {
    products: productReducer, // Reducer que maneja los productos
    auth: authReducer, // Reducer para manejar la autenticación
    users: userReducer,  // Asegúrate de agregar el reducer de 'users'
    projects: projectReducer,  // Asegúrate de que esté registrado en el store
  },
});
