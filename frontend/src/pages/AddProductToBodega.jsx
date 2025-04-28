// src/pages/AddProductToBodega.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const AddProductToBodega = () => {
  const navigate = useNavigate();

  const [productoId, setProductoId] = useState('');
  const [bodegaId, setBodegaId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [productos, setProductos] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  const token = localStorage.getItem('authToken');
  const userEmpresaId = localStorage.getItem('userEmpresaId'); // Obtener el ID de la empresa

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener los productos (se asume que la API devuelve productos filtrados por la empresa)
        const productosResponse = await fetch(`${process.env.REACT_APP_API_URL}/roomies/products?empresa_id=${userEmpresaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const productosData = await productosResponse.json();
  
        // Asegurarse de que productosData sea un array
        if (Array.isArray(productosData)) {
          setProductos(productosData);
        } else {
          console.error('Error: La respuesta no es un arreglo de productos.');
        }
  
        // Obtener las bodegas (se asume que la API devuelve bodegas filtradas por la empresa)
        const bodegasResponse = await fetch(`${process.env.REACT_APP_API_URL}/roomies/bodegas?empresa_id=${userEmpresaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const bodegasData = await bodegasResponse.json();
        
        // Filtramos las bodegas para asegurarnos de que sólo las de la empresa del usuario sean mostradas
        if (Array.isArray(bodegasData)) {
          const filteredBodegas = bodegasData.filter(bodega => bodega.empresa_id === userEmpresaId);
          setBodegas(filteredBodegas);
        } else {
          console.error('Error: La respuesta no es un arreglo de bodegas.');
        }
      } catch (error) {
        console.error('Error al cargar productos o bodegas:', error);
      }
    };
  
    fetchData();
  }, [token, userEmpresaId]);  // Asegúrate de que el ID de la empresa esté disponible

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productoId || !bodegaId || !cantidad) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos.',
      });
      return;
    }    

    // Asegúrate de enviar también el ID de la empresa (userEmpresaId)
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/roomies/addProductToBodega`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productoId,
          bodegaId,
          cantidad,
          empresa_id: userEmpresaId,  // Cambié 'empresaId' a 'empresa_id' aquí
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Producto agregado a la bodega con éxito.',
          confirmButtonColor: '#3cb424',
        });
        navigate('/dashboard');
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error || 'Hubo un error al agregar el producto a la bodega.',
        });
      }
      
    } catch (error) {
      console.error('Error al agregar producto a bodega:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Hubo un error al agregar el producto a la bodega.',
      });
    }
    
  };

  // Función para manejar la cancelación
  const handleCancel = () => {
    navigate('/dashboard');  // Redirigir al Dashboard si el usuario cancela
  };

  return (
    <div>
      <h1>Agregar Producto a Bodega</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="productoId">Seleccionar Producto:</label>
          <select
            id="productoId"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            className="form-control"
          >
            <option value="">Selecciona un producto</option>
            {productos.length > 0 ? (
              productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))
            ) : (
              <option value="">Cargando productos...</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="bodegaId">Seleccionar Bodega:</label>
          <select
            id="bodegaId"
            value={bodegaId}
            onChange={(e) => setBodegaId(e.target.value)}
            className="form-control"
          >
            <option value="">Selecciona una bodega</option>
            {bodegas.length > 0 ? (
              bodegas.map((bodega) => (
                <option key={bodega.id} value={bodega.id}>
                  {bodega.nombre} - {bodega.ubicacion}
                </option>
              ))
            ) : (
              <option value="">Cargando bodegas...</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="cantidad">Cantidad:</label>
          <input
            type="number"
            id="cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="form-control"
          />
        </div>

        {/* Contenedor de los botones */}
        <div className="button-container" style={{ marginTop: '20px' }}>
          {/* Botón de agregar producto */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ marginRight: '10px' }}
          >
            Agregar Producto a Bodega
          </button>

          {/* Botón de cancelar */}
          <button
            type="button"  // No debe ser tipo submit
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductToBodega;
