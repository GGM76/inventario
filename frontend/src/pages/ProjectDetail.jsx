// src/pages/ProjectDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import * as XLSX from 'xlsx';


const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [subprojects, setSubprojects] = useState([]);
  const [selectedSubproject, setSelectedSubproject] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'add' o 'return'
  const [productSelection, setProductSelection] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const projectRes = await axios.get(`${process.env.REACT_APP_API_URL}/roomies/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(projectRes.data);

        const subRes = await axios.get(`${process.env.REACT_APP_API_URL}/roomies/subprojects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubprojects(subRes.data || []);
      } catch (err) {
        setError('Error al obtener los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, token]);

  const handleInputChange = (productId, value) => {
    const numericValue = Math.max(0, parseInt(value) || 0);
    const maxAllowed = getMaxQuantity(productId);
  
    const adjustedValue = Math.min(numericValue, maxAllowed);
  
    setProductSelection(prev => ({
      ...prev,
      [productId]: adjustedValue
    }));
  };
  

  const handleOpenModal = (subproject, action) => {
    setSelectedSubproject(subproject);
    setModalAction(action);
    setProductSelection({});
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
  };

  const getMaxQuantity = (productId) => {
    if (!project) return 0;
  
    if (modalAction === 'use') {
      if (selectedSubproject) {
        const found = selectedSubproject.productos.find(p => p.id === productId);
        return found?.cantidad || 0;
      } else {
        const found = project.productos.find(p => p.id === productId);
        return found?.cantidadTotal || 0;
      }
    }
  
    if (modalAction === 'return' && selectedSubproject) {
      const found = selectedSubproject.productos.find(p => p.id === productId);
      return found?.cantidad || 0;
    }
  
    if (modalAction === 'add') {
      const found = project.productos.find(p => p.id === productId);
      return found?.cantidadTotal || 0;
    }
  
    return 0;
  };
  
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleSubmit = async () => {
    const productos = Object.entries(productSelection)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({ id, cantidad }));
  
    if (productos.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'Debes ingresar al menos una cantidad válida.',
      });      
      return;
    }
  
    try {
      let endpoint = '';
  
      if (modalAction === 'add') {
        endpoint = `${process.env.REACT_APP_API_URL}/roomies/subprojects/${selectedSubproject.id}/add-products`;
      } else if (modalAction === 'return') {
        endpoint = `${process.env.REACT_APP_API_URL}/roomies/subprojects/${selectedSubproject.id}/devolver-productos`;
      } else if (modalAction === 'use') {
        endpoint = selectedSubproject
          ? `${process.env.REACT_APP_API_URL}/roomies/subprojects/${selectedSubproject.id}/usar-productos`
          : `${process.env.REACT_APP_API_URL}/roomies/projects/${id}/usar-productos`;
      }
  
      await axios.put(endpoint, { productos }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'La operación se realizó correctamente.',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        window.location.reload();
      });      
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al procesar la solicitud.',
      });      
    }
  };
  
  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const handleDeleteProject = async () => {
    const confirmDelete = await Swal.fire({
      title: '¿Eliminar proyecto?',
      text: 'Esta acción eliminará el proyecto y todos sus subproyectos. ¿Deseas continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirmDelete.isConfirmed) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/roomies/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      Swal.fire({
        icon: 'success',
        title: 'Proyecto eliminado',
        text: 'El proyecto fue eliminado correctamente.',
      }).then(() => {
        navigate('/projects');
      });      
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: 'No se pudo eliminar el proyecto.',
      });      
    }
  };
  
  return (
    <div className="container mt-4">
      <h1>Detalles del Proyecto</h1>
      <p><strong>Nombre:</strong> {project.nombre}</p>
      <p><strong>Descripción:</strong> {project.descripcion}</p>

      <h4>Productos del Proyecto:</h4>
      {userRole === 'admin' && (
      <div className="d-flex gap-3 mb-3">
        <button
          className="btn btn-success me-2"
          onClick={() => {
            const data = project.productos.map(p => ({
              Producto: p.nombre,
              Cantidad: p.cantidadTotal
            }));
            exportToExcel(data, `Inventario_Proyecto_${project.nombre}`);
          }}
        >
          Descargar Inventario
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate(`/projects/${id}/add-products`)}
        >
          Actualizar Inventario
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/${id}/add-subproject`)}
        >
          Agregar Subproyecto
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleOpenModal(null, 'use')}
        >
          Usar Productos
        </button>
        <button
          className="btn btn-info"
          onClick={() => navigate(`/projects/${id}/historial`)}
        >
          Detalles de Uso
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDeleteProject}
        >
          Eliminar Proyecto
        </button>

      </div>
    )}
      <ul>
        {project.productos?.map(p => (
          <li key={p.id}>{p.nombre} — {p.cantidadTotal}</li>
        ))}
      </ul>

      <h4 className="mt-4">Subproyectos:</h4>
      {subprojects.length > 0 ? (
        <ul className="list-group">
          {subprojects.map(sp => (
            <li key={sp.id} className="list-group-item">
              <strong>{sp.nombre}</strong><br />
              {sp.descripcion}<br />
              <strong>Productos:</strong>
              <ul>
                {sp.productos.map(p => (
                  <li key={p.id}>{p.nombre}: {p.cantidad}</li>
                ))}
              </ul>
              {userRole === 'admin' && (
              <div className="d-flex flex-wrap gap-2 mt-2">
                <button
                  className="btn btn-success me-2"
                  onClick={() => handleOpenModal(sp, 'add')}
                >
                  Agregar Productos
                </button>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleOpenModal(sp, 'return')}
                >
                  Devolver Productos
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleOpenModal(sp, 'use')}
                >
                  Usar Productos
                </button>
                <button
                  className="btn btn-success me-2"
                  onClick={() => {
                    const data = sp.productos.map(p => ({
                      Producto: p.nombre,
                      Cantidad: p.cantidad
                    }));
                    exportToExcel(data, `Inventario_Subproyecto_${sp.nombre}`);
                  }}
                >
                  Descargar Inventario Subproyecto
                </button>

              </div>
            )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay subproyectos asociados.</p>
      )}

      {/* Modal Bootstrap */}
      <div className="modal fade" id="productModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title">
              {modalAction === 'add' && 'Agregar productos al subproyecto'}
              {modalAction === 'return' && 'Devolver productos al proyecto'}
              {modalAction === 'use' && (selectedSubproject ? 'Usar productos del subproyecto' : 'Usar productos del proyecto')}
            </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
            {(modalAction === 'add' || modalAction === 'use') && !selectedSubproject && project?.productos.map(p => (
              <div key={p.id} className="mb-2">
                <label>{p.nombre} (Máx: {getMaxQuantity(p.id)})</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max={getMaxQuantity(p.id)}
                  value={productSelection[p.id] || ''}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                />
              </div>
            ))}

            {(modalAction === 'add' || modalAction === 'use') && selectedSubproject && project?.productos.map(p => (
              <div key={p.id} className="mb-2">
                <label>{p.nombre} (Máx: {getMaxQuantity(p.id)})</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max={getMaxQuantity(p.id)}
                  value={productSelection[p.id] || ''}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                />
              </div>
            ))}

            {modalAction === 'return' && selectedSubproject?.productos.map(p => (
              <div key={p.id} className="mb-2">
                <label>{p.nombre} (Máx: {getMaxQuantity(p.id)})</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max={getMaxQuantity(p.id)}
                  value={productSelection[p.id] || ''}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                />
              </div>
            ))}
          </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
