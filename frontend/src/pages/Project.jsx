import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProjects } from '../redux/reducers/projectSlice';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';  // Importa SweetAlert2
import '../styles/Projects.css';

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';  
  const { projects, loading, error } = useSelector((state) => state.projects);
  const userEmpresaId = localStorage.getItem('userEmpresaId');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (userEmpresaId) {
      dispatch(fetchProjects(userEmpresaId));
    }
  }, [dispatch, userEmpresaId]);
  
  const handleDownloadAllHistories = async () => {
    const token = localStorage.getItem('authToken');
  
    try {
      let allHistories = [];
  
      for (const project of projects) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/roomies/projects/${project.id}/historial`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) continue;
  
        const history = await response.json();
  
        // Agregar campo de nombre del proyecto para distinguir en el Excel
        const enhanced = history.map(item => ({
          Proyecto: project.nombre,
          Producto: item.nombre,
          Subproyecto: item.subproyecto_nombre || 'Proyecto Principal',
          'Fecha de Uso': new Date(item.fecha).toLocaleDateString(),
          'Cantidad Usada': item.cantidad,
          Correo: item.correo,
        }));
  
        allHistories = allHistories.concat(enhanced);
      }
  
      if (allHistories.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay historial',
          text: 'No hay historial de uso disponible para ningún proyecto.',
        });
        return;
      }
  
      const worksheet = XLSX.utils.json_to_sheet(allHistories);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Total');
  
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(file, 'historial_uso_total.xlsx');
    } catch (error) {
      console.error('Error al descargar los historiales:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al descargar los detalles.',
      });
    }
  };
  

  const handleAddProject = () => {
    navigate('/add-project');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Filtrar los proyectos según el texto de búsqueda
  const filteredProjects = projects.filter(project =>
    project.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAllProjects = async () => {
    const confirm1 = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de que quieres eliminar TODOS los proyectos? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar todos',
      cancelButtonText: 'Cancelar',
    });
    
    if (!confirm1.isConfirmed) return;
  
    const confirm2 = await Swal.fire({
      title: 'Advertencia final',
      text: 'Esta es la última advertencia. TODOS los proyectos y subproyectos serán eliminados. ¿Deseas continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm2.isConfirmed) return;
  
    try {
      // Lógica para eliminar todos los proyectos uno por uno
      for (const project of projects) {
        await fetch(`${process.env.REACT_APP_API_URL}/roomies/projects/${project.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Proyectos Eliminados',
        text: 'Todos los proyectos han sido eliminados.',
      });
      dispatch(fetchProjects(userEmpresaId)); // Recarga la lista
    } catch (error) {
      console.error('Error al eliminar todos los proyectos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al eliminar los proyectos.',
      });
    }
  };
  
  return (
    <div className="projects-container">
      <h1>Proyectos</h1>
    
      {/* Sección de acciones */}
      <div className="projects-actions-box">
      <div className="projects-actions">
          {userRole === 'admin' && (
            <div className="action-left">
              <button onClick={handleAddProject} className="button-seed add">
                Agregar Proyecto
              </button>
              <button onClick={handleDeleteAllProjects} className="button-seed delete-all">
                Eliminar Todos los Proyectos
              </button>
              <button onClick={handleDownloadAllHistories} className="button-seed download-all">
                Descargar Todos los Detalles
              </button>
            </div>
          )}
          {/* Mover el botón 'Volver al Inventario' dentro de esta sección */}
          <div className="action-right">
            <button onClick={handleGoToDashboard} className="button-seed dashboard">
              Volver al Inventario
            </button>
          </div>
        </div>
      </div>  
      {/* Lista de proyectos */}
      <div className="projects-list-box">
        {loading ? (
          <p>Cargando proyectos...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          filteredProjects.length === 0 ? (
            <p>No hay proyectos disponibles.</p>
          ) : (
            <ul className="projects-list">
              {filteredProjects.map((project) => (
                <li key={project.id}>
                  <button
                    onClick={() => handleProjectClick(project.id)}
                    className="button-seed project"
                  >
                    {project.nombre}
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );  
};

export default Projects;
