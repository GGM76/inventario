import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();
  const userRole = localStorage.getItem('userRole');
  const [product, setProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null); // Guardamos el estado original
  const [isEditable, setIsEditable] = useState(false);  // Controla el modo de edición

  useEffect(() => {
    const fetchProductDetails = async () => {
      const response = await fetch(`http://localhost:8000/roomies/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setOriginalProduct(data); // Guardamos el producto original
      } else {
        console.error('Error al obtener los detalles del producto');
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleEnableEdit = () => {
    if (userRole === 'admin') {
      setIsEditable(true);
    } else {
      alert('No tienes permisos para editar');
    }
  };
  
  const handleGuardarCambios = async () => {
    const token = localStorage.getItem('authToken');
    const empresaId = localStorage.getItem('userEmpresaId');

    try {
      // Prepara la estructura para el backend
      const inventarioActualizado = product.bodegas.map((bodega) => ({
        producto_id: product.id,
        bodega_id: bodega.id,
        nuevaCantidad: parseInt(bodega.cantidad, 10),
      }));

      const response = await fetch('http://localhost:8000/roomies/update-inventory-manual', {
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

      alert('Inventario actualizado correctamente');
      setIsEditable(false);  // Desactiva el modo edición
    } catch (error) {
      console.error(error);
      alert('Hubo un error al actualizar el inventario');
    }
  };

  // Función para cancelar los cambios y restaurar los valores originales
  const handleCancelarCambios = () => {
    setProduct(originalProduct);  // Restaurar los valores originales
    setIsEditable(false);  // Desactivar el modo de edición
  };

  if (!product) return <div>Cargando...</div>;

  return (
    <div>
      <h3>Empresa: {product.empresa_id}</h3>

      {/* Mostrar detalles del producto */}
      <div>
        <h4>Producto:</h4>
        <p>Nombre: {product.nombre}</p>
        <p>Precio: ${product.precio}</p>
      </div>

      {/* Mostrar las bodegas y cantidades */}
      <div>
        <h4>Bodegas:</h4>
        {product.bodegas.length > 0 ? (
          <ul>
            {product.bodegas.map((bodega) => (
              <li key={bodega.id}>
                {bodega.nombre} - Ubicación: {bodega.ubicacion} - 
                {/* Modo de edición */}
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
                          b.id === bodega.id ? { ...b, cantidad: nuevaCantidad } : b
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

      {/* Botones de acción */}

      <div>
      {userRole === 'admin' && (
        isEditable ? (
          <>
            <button onClick={handleGuardarCambios}>Guardar Cambios</button>
            <button onClick={handleCancelarCambios}>Cancelar Cambios</button>
          </>
        ) : (
          <button onClick={handleEnableEdit}>Actualizar</button>
        )
      )}

      </div>
    </div>
  );
};

export default ProductDetails;
