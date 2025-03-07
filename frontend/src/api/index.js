// src/api/index.js
import axios from 'axios';

// URL base del backend
const BASE_URL = 'http://localhost:5000/api';  // Ajusta a la URL de tu API

const api = axios.create({
  baseURL: BASE_URL,
});

// Agregar el token de autenticación a cada solicitud
const token = localStorage.getItem('token');  // Suponiendo que tienes el token en localStorage
if (token) {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
}

// Función para obtener todos los productos
export const getProducts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/productos`);
    return response.data; // Devuelve los productos
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Función para agregar un nuevo producto
export const addProduct = async (product) => {
  try {
    const response = await axios.post(`${BASE_URL}/productos`, product);
    return response.data; // Devuelve el producto creado
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Función para actualizar un producto
export const updateProduct = async (id, updatedProduct) => {
  try {
    const response = await axios.put(`${BASE_URL}/products/${id}`, updatedProduct);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Función para eliminar un producto
export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
