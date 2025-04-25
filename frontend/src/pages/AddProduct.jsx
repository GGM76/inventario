///src/pages/AddProductPage.jsx
import React from 'react';
import ProductForm from '../components/ProductForm';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addProduct, fetchProducts } from '../redux/reducers/productSlice'; // Usamos Redux en lugar de API directa
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/AddProductPage.css';

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Obtener el ID de la empresa desde localStorage
  const userCompany = localStorage.getItem('userEmpresaId');
  const token = localStorage.getItem('authToken');  // Obtener el token desde el localStorage

  const handleSave = async (product) => {
    try {
      // Si el token no existe, puedes retornar un error o redirigir
      if (!token) {
        console.error('Token no encontrado');
        navigate('/login');  // Redirigir a la página de login si no existe el token
        return;
      }

      // Agregar el producto usando Redux, pero primero enviamos el token en las cabeceras
      await axios.post(
        'http://localhost:8000/roomies/products',  // URL del backend para agregar el producto
        product,
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Incluir el token en el header Authorization
          },
        }
      );
  
      // Después de agregar el producto, actualizar la lista de productos
      dispatch(fetchProducts());  // Recargar productos desde el backend
      Swal.fire({
        icon: 'success',
        title: '¡Producto agregado!',
        text: 'El producto se ha agregado exitosamente.',
        confirmButtonText: 'Aceptar',
      });
      console.log('Producto agregado exitosamente');
      navigate('/dashboard');  // Redirigir a la página del dashboard después de agregar el producto
    } catch (error) {
      console.error('Error agregando producto:', error);
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Hubo un error al agregar el producto. Inténtalo nuevamente.',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  return (
    <div className="add-product-page">
      <h1>Agregar Nuevo Producto</h1>
      {/* Pasamos el empresaId a ProductForm, pero el usuario no lo verá ni lo podrá modificar */}
      <ProductForm onSave={handleSave} empresaId={userCompany} />
    </div>
  );
};

export default AddProductPage;
