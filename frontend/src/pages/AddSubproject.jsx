import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import Swal from 'sweetalert2';

const AddSubproject = () => {
  const { projectId } = useParams();  // ID del proyecto principal
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [productos, setProductos] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/roomies/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const productosConDisponibilidad = response.data.productos.map((producto) => ({
          id: producto.id,
          nombre: producto.nombre,
          cantidadTotal: producto.cantidadTotal,
          cantidadUsada: producto.cantidadUsada || 0,
          cantidadDisponible: producto.cantidadTotal - (producto.cantidadUsada || 0),
        }));

        setProductos(productosConDisponibilidad);

        const initialQuantities = {};
        productosConDisponibilidad.forEach(p => {
          initialQuantities[p.id] = 0;
        });
        setProductQuantities(initialQuantities);

      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del proyecto principal.');
      }
    };

    if (projectId && token) {
      fetchProjectDetails();
    }
  }, [projectId, token]);

  const handleSelectProduct = (selectedOptions) => {
    setSelectedProductos(selectedOptions);

    const newQuantities = { ...productQuantities };
    selectedOptions.forEach(option => {
      if (!(option.value in newQuantities)) {
        newQuantities[option.value] = 0;
      }
    });
    setProductQuantities(newQuantities);
  };

  const handleQuantityChange = (productId, quantity) => {
    const producto = productos.find(p => p.id === productId);
    const maxCantidad = producto?.cantidadDisponible || 0;

    if (quantity > maxCantidad) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad excedida',
        text: `No puedes seleccionar más de ${maxCantidad} unidades para este producto.`,
        confirmButtonColor: '#ffc107',
      });
      quantity = maxCantidad;
    }    

    setProductQuantities(prev => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const productosConCantidad = selectedProductos.map((p) => {
        const productData = productos.find(prod => prod.id === p.value);
        return {
          id: p.value,
          nombre: productData?.nombre || '',
          cantidad: productQuantities[p.value] || 0,
        };
      });
  
      // Petición POST al backend
      await axios.post(`${process.env.REACT_APP_API_URL}/roomies/subprojects`, {
        nombre,
        descripcion,
        proyectoPrincipalId: projectId,
        productos: productosConCantidad,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      Swal.fire({
        icon: 'success',
        title: '¡Subproyecto creado!',
        text: 'El subproyecto se agregó correctamente.',
        confirmButtonColor: '#28a745',
      }).then(() => {
        navigate(`/projects/${projectId}`);
      });
      
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al agregar el subproyecto.',
        confirmButtonColor: '#dc3545',
      });
      
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <h1>Agregar Subproyecto</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre del Subproyecto</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Seleccionar Productos</label>
          <Select
            isMulti
            name="productos"
            options={productos.map(producto => ({
              value: producto.id,
              label: `${producto.nombre} (Disponible: ${producto.cantidadDisponible})`,
            }))}
            value={selectedProductos}
            onChange={handleSelectProduct}
          />
        </div>

        {selectedProductos.length > 0 && (
          <div>
            <h3>Asignar Cantidades:</h3>
            {selectedProductos.map((product) => {
              const productId = product.value;
              const productData = productos.find(p => p.id === productId);
              if (!productData) return null;

              return (
                <div key={productId}>
                  <label>{productData.nombre} (Disponible: {productData.cantidadDisponible})</label>
                  <input
                    type="number"
                    value={productQuantities[productId] || 0}
                    min="0"
                    max={productData.cantidadDisponible}
                    onChange={(e) => handleQuantityChange(productId, parseInt(e.target.value, 10))}
                    required
                  />
                </div>
              );
            })}
          </div>
        )}

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Cargando...' : 'Agregar Subproyecto'}
        </button>

        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          Cancelar
        </button>

      </form>
    </div>
  );
};

export default AddSubproject;
