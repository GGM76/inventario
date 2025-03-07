// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import ProductList from '../components/ProductList';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { getProducts } from '../api';  // Importamos la función para obtener productos

const DashboardPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();  // Obtenemos los productos desde el backend
        setProducts(productsData);  // Actualizamos el estado con los productos obtenidos
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);  // Solo se ejecuta una vez cuando el componente se monta

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="content">
        <Navbar />
        <ProductList products={products} />
      </div>
    </div>
  );
};

export default DashboardPage;
