// src/pages/AddProject.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import * as bootstrap from 'bootstrap';
import Swal from 'sweetalert2';
import '../styles/AddProject.css'; // Asegúrate de importar el archivo CSS

const AddProject = () => {
  const navigate = useNavigate();
  const { projectId: editProjectId } = useParams(); // Obtener ID del proyecto si está en modo edición

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [productos, setProductos] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [productMaxQuantities, setProductMaxQuantities] = useState({});
  const [productInventories, setProductInventories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userEmpresaId = localStorage.getItem('userEmpresaId');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/roomies/products?empresa_id=${userEmpresaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProductos(response.data);
        const initialQuantities = {};
        const initialMaxQuantities = {};
        const initialInventories = {};

        response.data.forEach(producto => {
          initialQuantities[producto.id] = 0;
          initialMaxQuantities[producto.id] = 0;
          initialInventories[producto.id] = [];
        });

        setProductQuantities(initialQuantities);
        setProductMaxQuantities(initialMaxQuantities);
        setProductInventories(initialInventories);

      } catch (err) {
        setError('Error al cargar los productos');
        console.error(err);
      }
    };

    if (userEmpresaId && token) {
      fetchProducts();
    }
  }, [userEmpresaId, token]);

  const fetchProductInventory = async (productId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/roomies/product-inventory?productoId=${productId}&empresa_id=${userEmpresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.bodegaInventarios || [];
    } catch (err) {
      console.error("Error al obtener inventario:", err);
      return [];
    }
  };

  const handleSelectProduct = async (selectedOptions) => {
    setSelectedProductos(selectedOptions);
    const newProductQuantities = { ...productQuantities };
    const newProductMaxQuantities = { ...productMaxQuantities };
    const newProductInventories = {};

    for (let option of selectedOptions) {
      const productId = option.value;
      const inventories = await fetchProductInventory(productId);
      newProductInventories[productId] = inventories;

      let totalQuantity = 0;
      inventories.forEach(bodega => {
        totalQuantity += bodega.cantidadDisponible;
      });

      newProductMaxQuantities[productId] = totalQuantity;
      newProductQuantities[productId] = {};
    }

    setProductQuantities(newProductQuantities);
    setProductMaxQuantities(newProductMaxQuantities);
    setProductInventories(newProductInventories);
  };

  const handleQuantityChange = (productId, quantity, bodegaId) => {
    const bodegaData = productInventories[productId]?.find(b => b.bodegaId === bodegaId);
    const availableQuantity = bodegaData?.cantidadDisponible || 0;
  
    const numericValue = Math.max(0, parseInt(quantity) || 0);
  
    if (numericValue > availableQuantity) {
      const modal = new bootstrap.Modal(document.getElementById('errorModal'));
      modal.show();
      return;
    }
  
    setProductQuantities(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [bodegaId]: numericValue
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productosConCantidad = selectedProductos.map((selectedProduct) => {
        const productId = selectedProduct.value;
        const selectedProductQuantities = productQuantities[productId];
        const selectedProductInventories = productInventories[productId];

        const bodegasSeleccionadas = selectedProductInventories.map(bodega => ({
          bodegaId: bodega.bodegaId,
          cantidadSeleccionada: selectedProductQuantities?.[bodega.bodegaId] || 0,
        }));

        const cantidadTotal = bodegasSeleccionadas.reduce((total, b) => total + b.cantidadSeleccionada, 0);

        return {
          id: productId,
          nombre: selectedProduct.label, // 👈 Asegurate de incluir esto
          cantidad: cantidadTotal,
          bodegasSeleccionadas,
        };        
      });

      if (productosConCantidad.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Falta información',
          text: 'Selecciona al menos un producto para continuar.',
        });
        return;
      }

      if (editProjectId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/roomies/projects/${editProjectId}/add-products`,
          { productos: productosConCantidad },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire({
          icon: 'success',
          title: 'Productos agregados',
          text: 'Los productos se agregaron correctamente al proyecto.',
          confirmButtonColor: '#28a745',
        }).then(() => {
          navigate(`/projects/${editProjectId}`);
        });
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/roomies/projects`,
          {
            nombre,
            descripcion,
            empresa_id: userEmpresaId,
            productos: productosConCantidad,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire({
          icon: 'success',
          title: 'Proyecto creado',
          text: 'El proyecto fue creado exitosamente.',
          confirmButtonColor: '#28a745',
        }).then(() => {
          navigate('/projects');
        });
      }
    } catch (err) {
      if (err.response) {
        setError(`Hubo un error: ${err.response.data.error}`);
      } else {
        setError('Hubo un error desconocido al agregar el proyecto');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-project-container">
      <h1>
        {editProjectId ? 'Agregar productos al proyecto existente' : 'Crear nuevo proyecto'}
      </h1>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        {!editProjectId && (
          <>
            <div>
              <label htmlFor="nombre">Nombre del Proyecto</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="productos">Seleccionar Productos</label>
          <div className="select-container">
            <Select
              isMulti
              name="productos"
              options={productos.map(producto => ({
                value: producto.id,
                label: producto.nombre,
              }))}
              value={selectedProductos}
              onChange={handleSelectProduct}
              classNamePrefix="react-select" // Para usar la clase personalizada de react-select
            />
          </div>
        </div>

        {selectedProductos.length > 0 && (
          <div>
            <h3>Selecciona cantidades por bodega:</h3>
            {selectedProductos.map((product) => {
              const productId = product.value;
              const productData = productos.find(p => p.id === productId);
              const bodegaInventarios = productInventories[productId] || [];

              return (
                <div key={productId}>
                  <label className="producto-titulo">{productData?.nombre}</label>
                  {bodegaInventarios.map((bodega) => (
                    <div key={bodega.bodegaId}>
                      <label>
                        {bodega.bodegaNombre} - Disponibles: {bodega.cantidadDisponible}
                      </label>
                      <input
                        type="number"
                        value={productQuantities[productId]?.[bodega.bodegaId] || 0}
                        onChange={(e) => handleQuantityChange(productId, parseInt(e.target.value, 10), bodega.bodegaId)}
                        min="0"
                        max={bodega.cantidadDisponible}
                        required
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <button type="submit" className="custom-btn add-btn">
          {editProjectId ? 'Guardar productos en el proyecto' : 'Crear proyecto'}
        </button>
        <button type="button" className="custom-btn cancel-btn ms-2" onClick={() => navigate('/projects')}>
          Cancelar
        </button>
      </form>

      {/* Modal de Error */}
      <div className="modal fade" id="errorModal" tabIndex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="errorModalLabel">Cantidad no válida</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              La cantidad seleccionada excede el inventario disponible en la bodega.
            </div>
            <div className="modal-footer">
              <button type="button" className="custom-btn" data-bs-dismiss="modal">Entendido</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
