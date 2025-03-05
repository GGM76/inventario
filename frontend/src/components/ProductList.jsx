import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Traer los productos desde la API
    axios.get('/roomies/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Hubo un error al obtener los productos', error);
      });
  }, []);

  const handleDelete = (id) => {
    // Llamar a la API para eliminar el producto
    axios.delete(`/roomies/products/${id}`)
      .then(() => {
        setProducts(products.filter(product => product.id !== id));
      })
      .catch(error => {
        console.error('Hubo un error al eliminar el producto', error);
      });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase()) ||
    product.quantity.toString().includes(search)
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.quantity}</td>
              <td>
                <Link to={`/edit-product/${product.id}`}>Editar</Link>
                <button onClick={() => handleDelete(product.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/add-product">Añadir Producto</Link>
    </div>
  );
};

export default ProductList;
