import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import Swal from 'sweetalert2';


const MassProductUpload = () => {
  const [file, setFile] = useState(null);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [bodegas, setBodegas] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const empresaId = localStorage.getItem('userEmpresaId');

  // Obtener bodegas
  useEffect(() => {
    const fetchBodegas = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/roomies/bodegas?empresa_id=${empresaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setBodegas(data);
      } catch (error) {
        console.error("Error al obtener bodegas:", error);
      }
    };

    fetchBodegas();
  }, [empresaId, token]);

  // Leer el archivo Excel
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      if (parsedData.length === 0) {
        setError("El archivo está vacío o mal formateado.");
        setProductos([]);
        return;
      }

      setProductos(parsedData);
      setError(null);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Subir los productos al backend
  const handleUpload = async () => {
    if (!file) {
      return Swal.fire({
        icon: 'warning',
        title: 'Archivo faltante',
        text: 'Por favor, selecciona un archivo Excel antes de continuar.',
      });
    }
    
    if (productos.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Sin productos',
        text: 'No hay productos para subir. Verifica el contenido del archivo.',
      });
    }    

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/roomies/productos/masivos`, {
        productos,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Swal.fire({
        icon: 'success',
        title: '¡Carga exitosa!',
        text: 'Los productos fueron agregados correctamente al sistema.',
        confirmButtonColor: '#28a745',
      }).then(() => {
        navigate('/dashboard'); // o a la ruta que desees
      });  
      setFile(null);
      setProductos([]);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al subir los productos. Intenta nuevamente.',
      });      
    }
  };

  // Generar archivo TXT con bodegas
  const descargarTxtBodegas = () => {
    const contenido = bodegas.map(b => `Ubicacion: ${b.ubicacion} | Nombre: ${b.nombre} | ID: ${b.id}`).join('\n');
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bodegas.txt';
    link.click();
  };

  const descargarPlantillaExcel = () => {
    const headers = [
      ['clave', 'categoria', 'nombre', 'precio', 'bodegaId', 'cantidad']
    ];
  
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PlantillaProductos');
  
    XLSX.writeFile(workbook, 'plantilla_productos.xlsx');
  };
  

  return (
    <div className="container mt-4">
      <h2>Agregación Masiva de Productos</h2>
      <p>Sube un archivo Excel con los campos obligatorios:</p>
      <ul>
        <li><strong>clave</strong></li>
        <li><strong>categoria</strong></li>
        <li><strong>nombre</strong></li>
        <li><strong>precio</strong></li>
        <li><strong>bodegaId</strong></li>
        <li><strong>cantidad</strong></li>
      </ul>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="form-control mb-3" />

      {bodegas.length > 0 && (
        <div className="mb-3 d-flex gap-2">
        <button className="btn btn-info" onClick={descargarTxtBodegas}>
          Descargar IDs de Bodegas
        </button>
        <button className="btn btn-secondary" onClick={descargarPlantillaExcel}>
          Descargar Plantilla Excel
        </button>
      </div>      
      )}

      {error && <p className="text-danger">{error}</p>}

      {productos.length > 0 && (
        <>
          <h5>Vista previa:</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                {Object.keys(productos[0]).map((key) => <th key={key}>{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {productos.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn btn-success" onClick={handleUpload}>
            Subir al sistema
          </button>
        </>
      )}
    </div>
  );
};

export default MassProductUpload;
