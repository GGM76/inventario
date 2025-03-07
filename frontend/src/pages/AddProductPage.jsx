// src/pages/AddProductPage.js
import React from 'react';
import ProductForm from '../components/ProductForm';
import { addProduct } from '../api'; // Importamos la función para agregar productos

const AddProductPage = () => {
  const handleSave = async (product) => {
    try {
      await addProduct(product);  // Llamamos a la función para agregar el producto
      // Puedes redirigir a otra página o mostrar un mensaje de éxito
      console.log('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div className="add-product-page">
      <h1>Producto nuevo</h1>
      <ProductForm onSave={handleSave} />
    </div>
  );
};

export default AddProductPage;
