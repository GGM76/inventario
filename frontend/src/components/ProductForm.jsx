import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Usamos useNavigate en vez de useHistory

const ProductForm = () => {
  const [product, setProduct] = useState({ name: '', category: '', quantity: 0 });
  const { id } = useParams();
  const navigate = useNavigate();  // Usamos useNavigate aquí

  useEffect(() => {
    if (id) {
      // Si es un formulario de editar, cargar los datos del producto
      axios.get(`http://localhost:5000/roomies/products/${id}`)
        .then(response => {
          setProduct(response.data);
        })
        .catch(error => {
          console.error('Error al obtener el producto', error);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = id ? 'put' : 'post';
    const url = id ? `http://localhost:5000/api/products/${id}` : 'http://localhost:5000/api/products';

    axios[method](url, product)
      .then(() => {
        navigate('/dashboard'); // Usamos navigate para redirigir al dashboard
      })
      .catch(error => {
        console.error('Hubo un error al guardar el producto', error);
      });
  };

  return (
    <div>
      <h2>{id ? 'Editar Producto' : 'Añadir Producto'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={product.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Categoría"
          value={product.category}
          onChange={handleChange}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Cantidad"
          value={product.quantity}
          onChange={handleChange}
        />
        <button type="submit">{id ? 'Actualizar Producto' : 'Añadir Producto'}</button>
      </form>
    </div>
  );
};

export default ProductForm;
