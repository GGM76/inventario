import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProjects } from '../redux/reducers/projectSlice';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div>
      <h1>Proyectos</h1>
      {userRole === 'admin' && (
        <button onClick={handleAddProject}>Agregar Proyecto</button>
      )}

      {loading ? (
        <p>Cargando proyectos...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          {filteredProjects.length === 0 ? (
            <p>No hay proyectos disponibles.</p>
          ) : (
            <ul>
              {filteredProjects.map((project) => (
                <li key={project.id}>
                  <button onClick={() => handleProjectClick(project.id)}>
                    {project.nombre}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
