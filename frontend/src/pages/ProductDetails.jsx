import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const userRole = localStorage.getItem('userRole');
  const [product, setProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/roomies/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setOriginalProduct(data);
      } else {
        console.error('Error al obtener los detalles del producto');
      }
    };

    fetchProductDetails();
  }, [id]);

  // Activa modo edición solo para administradores.
  const handleEnableEdit = () => {
    if (userRole === 'admin') {
      setIsEditable(true);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso denegado',
        text: 'No tienes permisos para editar.',
      });      
    }
  };
  
  // Guarda los cambios manuales de inventario para cada bodega.
  const handleGuardarCambios = async () => {
    const token = localStorage.getItem('authToken');

    try {
      const inventarioActualizado = product.bodegas.map((bodega) => ({
        producto_id: product.id,
        bodega_id: bodega.id,
        nuevaCantidad: parseInt(bodega.cantidad, 10),
      }));

      const response = await fetch(`${process.env.REACT_APP_API_URL}/roomies/update-inventory-manual`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ inventario: inventarioActualizado }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el inventario');
      }
      Swal.fire({
        icon: 'success',
        title: 'Inventario actualizado',
        text: 'Los cambios se han guardado correctamente.',
        confirmButtonColor: '#3cb424',
      });
      setIsEditable(false);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al actualizar el inventario.',
      });      
    }
  };

  // Cancela la edición y restaura los datos originales.
  const handleCancelarCambios = () => {
    setProduct(originalProduct);
    setIsEditable(false);
  };

  if (!product) return <div>Cargando...</div>;

  return (
    <div className="product-details-container">
      <h3>Empresa: {product.empresa_id}</h3>

      <div>
        <h4>Producto:</h4>
        <p>Nombre: {product.nombre}</p>
        <p>Precio: ${product.precio}</p>
      </div>

      <div>
        <h4>Bodegas:</h4>
        {product.bodegas.length > 0 ? (
          <ul>
            {product.bodegas.map((bodega) => (
              <li key={bodega.id || bodega.bodegaId}>
                {bodega.nombre} - Ubicación: {bodega.ubicacion} - 
                {isEditable ? (
                  <input
                    type="number"
                    min="0"
                    value={bodega.cantidad}
                    onChange={(e) => {
                      const nuevaCantidad = e.target.value;
                      setProduct(prev => ({
                        ...prev,
                        bodegas: prev.bodegas.map(b =>
                            (b.id === bodega.id || b.bodegaId === bodega.bodegaId) ? { ...b, cantidad: nuevaCantidad } : b
                        ),
                      }));
                    }}
                  />
                ) : (
                  <span>{bodega.cantidad}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay bodegas asociadas para este producto.</p>
        )}
      </div>

      <div className="button-group">
        {userRole === 'admin' && (
          isEditable ? (
            <>
              <button onClick={handleGuardarCambios} className="custom-btn add-btn">Guardar Cambios</button>
              <button onClick={handleCancelarCambios} className="custom-btn cancel-btn">Cancelar Cambios</button>
            </>
          ) : (
            <button onClick={handleEnableEdit} className="custom-btn project-btn">Actualizar</button>
          )
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
