// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { logout } from '../redux/reducers/authSlice';
import { useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { fetchProductTotalQuantity, fetchProducts, deleteProduct, setProducts } from '../redux/reducers/productSlice';
import BodegaFormModal from '../components/BodegaFormModal';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import '../styles/DashboardPage.css';

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
  const isSeedgroup = userEmpresaId === 'Seedgroup';
  const theme = isSeedgroup ? 'seedgroup' : 'default';
  const [showBodegaModal, setShowBodegaModal] = useState(false);  

  // Función para verificar si el usuario es admin
  const checkAdminPermission = () => {
    if (userRole !== 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para realizar esta acción.',
      });
      return false;
    }
    return true;
  };  
  // Filtrar productos por el query de búsqueda
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  ); 

  const handleExportToExcel = () => {
    if (!products || products.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text: 'No hay productos para exportar.'
      });
      return;
    }
  
    const exportData = products.map((product) => ({
      Nombre: product.nombre,
      Categoría: product.categoria || '',
      Cantidad_Total: product.totalQuantity ?? 0,
      Precio: product.precio || '',
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
  
    XLSX.writeFile(workbook, 'inventario.xlsx');
  };
  
  useEffect(() => {
    if (userEmpresaId) {
      dispatch(fetchProducts(userEmpresaId)).then(() => {
        setIsLoaded(true);
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los productos.',
        });
      });
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
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el producto permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  
    if (result.isConfirmed) {
      try {
        await dispatch(deleteProduct(productId));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Producto eliminado con éxito',
          confirmButtonColor: '#3cb424'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al eliminar el producto',
        });
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

  const empresaLogos = {
    Seedgroup: '/images/seed-logo.png',
    Mutis: '/images/mutis-logo.jfif',
    Pico: '/images/pico-logo.png',
    Incedo: '/images/incedo-logo.jpg'
    
  };
  
  const logoSrc = empresaLogos[userEmpresaId] || '/images/default-logo.png';

  return (
    <div className={`dashboard ${theme}`}>
        <div className="dashboard-header">
        <img src={logoSrc} alt="Logo Empresa" className="company-logo" />
      </div>
      
      <h1>Inventario</h1>

      {userRole === 'admin' && (
        <div className="dashboard-buttons">
          <button className="custom-btn add-btn" onClick={handleAddProduct}>Agregar Producto</button>
          <button className="custom-btn add-btn" onClick={handleAddBodega}>Agregar Bodega</button>
          <button className="custom-btn add-btn" onClick={handleAddProductToBodega}>Poner productos en bodegas</button>
          <button className="custom-btn add-btn" onClick={() => navigate('/mass-product-upload')}>Agregación Masiva</button>
          <button className="custom-btn" onClick={handleExportToExcel}>  Descargar Inventario</button>

        </div>
      )}


{showBodegaModal && (
  <BodegaFormModal
    onClose={() => setShowBodegaModal(false)}
    onSuccess={() => {
      Swal.fire({
        icon: 'success',
        title: '¡Bodega agregada!',
        text: 'La bodega fue registrada con éxito.',
        confirmButtonColor: '#3cb424'
      });
      setShowBodegaModal(false);
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
