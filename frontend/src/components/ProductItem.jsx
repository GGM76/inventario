// src/components/ProductItem.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductItem = ({ product, handleDelete, userRole }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/product-details/${product.id}`);
  };

  // Asegurarse de que totalQuantity es un número
  const totalQuantity = Number(product.totalQuantity); // Convertimos totalQuantity a un número

  return (
    <div className="product-item">
      <h3>{product.nombre}</h3>
      <p>Cantidad total: {totalQuantity.toLocaleString()}</p> {/* Usando toLocaleString para agregar comas a los números grandes */}
      <p>Precio: ${product.precio}</p>

      {/* Mostrar el botón de eliminar solo si el usuario es admin */}
      {userRole === 'admin' && (
        <button onClick={() => handleDelete(product.id)} className="delete-button">Eliminar</button>
      )}

      {/* Botón para ver detalles del producto */}
      <button onClick={handleClick} className="details-button">Ver detalles</button>
    </div>
  );
};

export default ProductItem;
