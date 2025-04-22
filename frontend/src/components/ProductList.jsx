// src/components/ProductList.js
import React from 'react';
import ProductItem from './ProductItem';

const ProductList = ({ products, handleDelete, userRole }) => {
  return (
    <div className="product-list">
      {products.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        products.map((product) => (
          <ProductItem 
            key={product.id} 
            product={product} 
            totalQuantity={product.totalQuantity} 
            handleDelete={handleDelete}
            userRole={userRole}  // Pasamos el userRole a ProductItem
          />
        ))
      )}
    </div>
  );
};

export default ProductList;
