// src/components/ProductForm.js
import React, { useState } from 'react';

const ProductForm = ({ onSave, product = {} }) => {
  // Establecemos los estados de cada campo (con valores predeterminados si estamos editando)
  const [nombre, setNombre] = useState(product.nombre || '');  // nombre del producto
  const [cantidad, setCantidad] = useState(product.cantidad || '');  // cantidad en inventario
  const [precio, setPrecio] = useState(product.precio || '');  // precio del producto
  const [empresaId, setEmpresaId] = useState(product.empresa_id || '');  // id de la empresa

  // Manejo del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Llamamos a la función onSave que se pasa como prop con los valores del formulario
    onSave({
      nombre,
      cantidad,
      precio,
      empresa_id: empresaId,  // Renombramos el campo a empresa_id
    });

    // Limpiamos el formulario después de enviar (esto es opcional, solo si quieres limpiar los campos)
    setNombre('');
    setCantidad('');
    setPrecio('');
    setEmpresaId('');
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>{product.id ? 'Editar Producto' : 'Agregar Producto'}</h2>
      
      {/* Campo para el nombre */}
      <div>
        <label htmlFor="nombre">Nombre del Producto</label>
        <input
          type="text"
          id="nombre"
          placeholder="Ingrese el nombre del producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      {/* Campo para la cantidad */}
      <div>
        <label htmlFor="cantidad">Cantidad</label>
        <input
          type="number"
          id="cantidad"
          placeholder="Ingrese la cantidad en inventario"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />
      </div>

      {/* Campo para el precio */}
      <div>
        <label htmlFor="precio">Precio</label>
        <input
          type="number"
          id="precio"
          placeholder="Ingrese el precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
      </div>

      {/* Campo para el ID de la empresa */}
      <div>
        <label htmlFor="empresaId">Empresa</label>
        <input
          type="text"
          id="empresaId"
          placeholder="Empresa"
          value={empresaId}
          onChange={(e) => setEmpresaId(e.target.value)}
          required
        />
      </div>

      {/* Botón para enviar el formulario */}
      <button type="submit">{product.id ? 'Actualizar Producto' : 'Agregar Producto'}</button>
    </form>
  );
};

export default ProductForm;
