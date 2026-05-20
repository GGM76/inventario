// src/pages/ProjectMassUpload.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProjectMassUpload = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);

  // Campos del formulario
  const [formData, setFormData] = useState({
    ejecutivoCuenta: '',
    grouper: '',
    empresa: '',
    centroCostos: '',
    cotizacion: '',
    fechaSolicitud: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // Obtener datos del proyecto
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/roomies/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(res.data);
      } catch (err) {
        console.error('Error al obtener proyecto:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del proyecto.',
        }).then(() => navigate(`/projects/${projectId}`));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generar plantilla Excel
  const descargarPlantilla = () => {
    if (!project || !project.productos) return;

    const fixedHeaders = ['CIUDAD', 'CONTACTO', 'DIRECCION', 'PAQUETERIAS', 'GUIAS', 'TELEFONO', 'DEMOS'];
    const productHeaders = project.productos.map(p => p.nombre);
    const headers = [...fixedHeaders, ...productHeaders];

    const exampleRow = headers.map(() => '');
    const worksheetData = [headers, exampleRow];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

    XLSX.writeFile(workbook, `plantilla_${project.nombre.replace(/\s+/g, '_')}.xlsx`);
  };

  // Validar datos del archivo
  const validateFile = (data) => {
    const newErrors = [];
    const productNames = project.productos.map(p => p.nombre);
    const fixedColumns = ['CIUDAD', 'CONTACTO', 'DIRECCION', 'PAQUETERIAS', 'GUIAS', 'TELEFONO', 'DEMOS'];

    data.forEach((row, index) => {
      const rowErrors = [];

      // Validar campos fijos
      fixedColumns.forEach(col => {
        if (!row[col]) {
          rowErrors.push(`Fila ${index + 1}: Falta "${col}"`);
        }
      });

      // Validar productos
      productNames.forEach(productName => {
        const value = row[productName];
        if (value === undefined || value === null || value === '') {
          rowErrors.push(`Fila ${index + 1}: Falta valor para "${productName}"`);
        } else if (isNaN(Number(value))) {
          rowErrors.push(`Fila ${index + 1}: "${productName}" debe ser un número`);
        } else {
          const product = project.productos.find(p => p.nombre === productName);
          if (product && Number(value) > product.cantidadTotal) {
            rowErrors.push(`Fila ${index + 1}: "${productName}" excede inventario (máx: ${product.cantidadTotal})`);
          }
        }
      });

      if (rowErrors.length > 0) {
        newErrors.push(...rowErrors);
      }
    });

    return newErrors;
  };

  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setErrors([]);
    setPreviewData([]);

    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        if (parsedData.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Archivo vacío',
            text: 'El archivo no contiene datos.',
          });
          return;
        }

        const validationErrors = validateFile(parsedData);
        setErrors(validationErrors);
        setPreviewData(parsedData);

      } catch (err) {
        console.error('Error al leer archivo:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo leer el archivo Excel.',
        });
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Enviar datos al backend
  const handleSubmit = async () => {
    const requiredFields = ['ejecutivoCuenta', 'grouper', 'empresa', 'centroCostos', 'cotizacion', 'fechaSolicitud'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: `Falta completar: ${missingFields.join(', ')}`,
      });
      return;
    }

    if (previewData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Sube un archivo Excel primero.',
      });
      return;
    }

    if (errors.length > 0) {
      const confirm = await Swal.fire({
        icon: 'warning',
        title: 'Errores en el archivo',
        text: 'El archivo tiene errores. ¿Deseas continuar de todos modos?',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Corregir errores',
      });

      if (!confirm.isConfirmed) return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/roomies/projects/${projectId}/mass-use`, {
        metadata: formData,
        productos: previewData
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Swal.fire({
        icon: 'success',
        title: '¡Carga exitosa!',
        text: 'Los productos fueron registrados correctamente.',
        confirmButtonColor: '#28a745',
      }).then(() => {
        navigate(`/projects/${projectId}`);
      });
    } catch (err) {
      console.error('Error al subir:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al procesar la solicitud.',
      });
    }
  };

  if (loading) return <div className="container mt-4"><p>Cargando...</p></div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Uso Masivo de Productos</h2>
        <button className="btn btn-secondary" onClick={() => navigate(`/projects/${projectId}`)}>
          Volver al Proyecto
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Información del Proyecto</h5>
        </div>
        <div className="card-body">
          <p><strong>Proyecto:</strong> {project?.nombre}</p>
          <p><strong>Productos disponibles:</strong> {project?.productos?.length}</p>
        </div>
      </div>

      {/* Formulario de metadata */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Datos de Solicitud</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {Object.keys(formData).map((key) => (
              <div className="col-md-4 mb-3" key={key}>
                <label className="form-label">{key.replace(/([A-Z])/g, ' $1').toUpperCase()} *</label>
                <input
                  type={key === 'fechaSolicitud' ? 'date' : 'text'}
                  className="form-control"
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de archivo Excel */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Carga de Excel</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Seleccionar archivo Excel</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="form-control"
            />
          </div>
          
          <button 
            className="btn btn-outline-primary" 
            onClick={descargarPlantilla}
            disabled={!project || !project.productos}
          >
            Descargar Plantilla Excel
          </button>

          {/* Inventario disponible */}
          {project && project.productos && (
            <div className="mt-3">
              <h6>Inventario disponible:</h6>
              <ul>
                {project.productos.map(p => (
                  <li key={p.id}>{p.nombre}: {p.cantidadTotal} unidades</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="alert alert-danger">
          <h6>Errores encontrados:</h6>
          <ul className="mb-0">
            {errors.slice(0, 10).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
            {errors.length > 10 && <li>...y {errors.length - 10} errores más</li>}
          </ul>
        </div>
      )}

      {/* Vista previa */}
      {previewData.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Vista Previa ({previewData.length} registros)</h5>
          </div>
          <div className="card-body" style={{ overflowX: 'auto' }}>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  {Object.keys(previewData[0]).map(key => (
                    <th key={key} style={{ whiteSpace: 'nowrap' }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 5 && (
              <p className="text-muted">Mostrando 5 de {previewData.length} registros</p>
            )}
          </div>
        </div>
      )}

      {/* Botón de envío */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          Cancelar
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={previewData.length === 0}
        >
          Registrar Uso
        </button>
      </div>
    </div>
  );
};

export default ProjectMassUpload;