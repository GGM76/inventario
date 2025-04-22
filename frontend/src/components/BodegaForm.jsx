// src/components/BodegaForm.js
import React, { useState } from 'react';

const BodegaForm = ({ products }) => {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validar que los campos no estén vacíos
    if (!productoId || !cantidad || !ubicacion) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/roomies/bodegas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ producto_id: productoId, cantidad, ubicacion }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Bodega agregada correctamente');
        setProductoId('');
        setCantidad('');
        setUbicacion('');
      } else {
        setError(data.error || 'Hubo un error al agregar la bodega');
      }
    } catch (error) {
      setError('Hubo un error en la conexión con el servidor');
    }
  };

  return (
    <div>
      <h3>Agregar Bodega</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="producto_id">Producto</label>
          <select
            id="producto_id"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
          >
            <option value="">Selecciona un producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cantidad">Cantidad</label>
          <input
            type="number"
            id="cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="ubicacion">Ubicación</label>
          <input
            type="text"
            id="ubicacion"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            required
          />
        </div>
        <button type="submit">Agregar Bodega</button>
      </form>
    </div>
  );
};

export default BodegaForm;
