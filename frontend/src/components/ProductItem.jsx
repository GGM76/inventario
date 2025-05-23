// src/components/ProductItem.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductItem.css';

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

      <div className="button-group">
      {userRole === 'admin' && (
        <button onClick={() => handleDelete(product.id)} className="custom-btn delete-btn">
          Eliminar
        </button>
      )}
      <button onClick={handleClick} className="custom-btn add-btn">
        Detalles
      </button>
      </div>
    </div>
  );
};

export default ProductItem;
