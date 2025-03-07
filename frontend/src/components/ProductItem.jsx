// src/components/ProductItem.js
import React from 'react';
import { deleteProduct } from '../api';  // Importamos la función para eliminar productos

const ProductItem = ({ product }) => {
  const handleDelete = async () => {
    try {
      await deleteProduct(product.id);  // Llamamos a la API para eliminar el producto
      console.log(`Product with id ${product.id} deleted`);
      // Podrías actualizar el estado del componente principal para eliminarlo de la lista visualmente
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="product-item">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.quantity}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default ProductItem;
