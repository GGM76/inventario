// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { logout } from '../redux/reducers/authSlice';
import { useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { fetchProductTotalQuantity, fetchProducts, deleteProduct, setProducts } from '../redux/reducers/productSlice';
import BodegaFormModal from '../components/BodegaFormModal';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((state) => state.products);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isQuantitiesLoaded, setIsQuantitiesLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const userRole = localStorage.getItem('userRole');
  const userEmpresaId = localStorage.getItem('userEmpresaId');
  const [showBodegaModal, setShowBodegaModal] = useState(false);

  // Función para verificar si el usuario es admin
  const checkAdminPermission = () => {
    if (userRole !== 'admin') {
      alert("No tienes permisos para realizar esta acción.");
      return false;
    }
    return true;
  };

  // Filtrar productos por el query de búsqueda
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  
  useEffect(() => {
    if (userEmpresaId) {
        dispatch(fetchProducts(userEmpresaId)).then(() => {
            setIsLoaded(true);
        }).catch(() => alert("Error al cargar los productos"));
    }
  }, [dispatch, userEmpresaId, navigate]);

  useEffect(() => {
    if (isLoaded && userEmpresaId && !isQuantitiesLoaded) {
        const getTotalQuantity = async () => {
            try {
                const updatedProducts = await Promise.all(
                    products.map(async (product) => {
                        let retries = 3;
                        let totalQuantityResponse;

                        while (retries > 0) {
                            try {
                                totalQuantityResponse = await dispatch(fetchProductTotalQuantity({
                                    productoId: product.id,
                                    empresaId: userEmpresaId
                                }));
                                break;
                            } catch (error) {
                                retries -= 1;
                                if (retries === 0) throw error;
                                console.warn('Reintento al obtener cantidad total de producto:', retries);
                            }
                        }

                        const totalQuantity = totalQuantityResponse.payload?.totalQuantity;
                        if (totalQuantity !== undefined) {
                            return { ...product, totalQuantity };
                        } else {
                            return { ...product, totalQuantity: 0 };
                        }
                    })
                );
                dispatch(setProducts(updatedProducts));
                setIsQuantitiesLoaded(true);
            } catch (error) {
                console.error('Error al obtener las cantidades totales de los productos:', error);
            }
        };

        getTotalQuantity();
    }
  }, [isLoaded, dispatch, products, userEmpresaId, isQuantitiesLoaded]);

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await dispatch(deleteProduct(productId));
        alert('Producto eliminado con éxito');
      } catch (error) {
        alert('Hubo un error al eliminar el producto');
      }
    }
  };

  const handleAddProduct = () => {
    if (checkAdminPermission()) {
      navigate('/add-product');
    }
  };

  const handleAddBodega = () => {
    if (checkAdminPermission()) {
      setShowBodegaModal(true);
    }
  };

  const handleAddProductToBodega = () => {
    if (checkAdminPermission()) {
      navigate('/add-product-to-bodega');
    }
  };

  const handleManageUsers = () => {
    navigate('/manage-users');
  };

  const handleProjects = () => {
    navigate('/projects');  // Redirige a la página de proyectos
  };

  return (
    <div>
      <h1>Inventario</h1>

      {/* Mostrar los botones solo si el usuario es admin */}
      {userRole === 'admin' && (
  <>
    <button onClick={handleAddProduct}>Agregar Producto</button>
    <button onClick={handleAddBodega}>Agregar Bodega</button>
    <button onClick={handleAddProductToBodega}>Poner productos en bodegas</button>
    <button onClick={() => navigate('/mass-product-upload')}>Agregación Masiva</button>
  </>
)}

{showBodegaModal && (
  <BodegaFormModal
    onClose={() => setShowBodegaModal(false)}
    onSuccess={() => {
      alert('Bodega agregada con éxito');
      setShowBodegaModal(false);
      // Aquí podrías refrescar datos si es necesario
    }}
  />
)}


      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? <p>Cargando...</p> : filteredProducts.length === 0 ? <p>No hay productos disponibles.</p> : (
        <ProductList products={filteredProducts} handleDelete={handleDelete} userRole={userRole} />
      )}
    </div>
  );
};

export default Dashboard;
