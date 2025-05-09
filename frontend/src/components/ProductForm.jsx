//src/components/ProductForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/ProductForm.css';
import '../styles/buttons.css';
import '../styles/inputs.css';


const ProductForm = ({ onSave, empresaId }) => {
  const navigate = useNavigate();

  const [clave, setClave] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Enviar los datos del producto al componente padre (AddProductPage)
    onSave({
      clave,
      categoria,
      nombre,
      precio,
      empresa_id: empresaId, // Usamos el empresaId pasado como prop
    });
  };

  // Función para manejar la cancelación
  const handleCancel = () => {
    Swal.fire({
      title: '¿Cancelar?',
      text: 'Los cambios no guardados se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/dashboard');
      }
    });
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label className="custom-label">Clave:</label>
        <input 
          type="text" 
          value={clave} 
          onChange={(e) => setClave(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="custom-label">Categoría:</label>
        <input 
          type="text" 
          value={categoria} 
          onChange={(e) => setCategoria(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="custom-label">Nombre:</label>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="custom-label">Precio:</label>
        <input 
          type="number" 
          value={precio} 
          onChange={(e) => setPrecio(e.target.value)} 
          required 
        />
      </div>

      {/* Contenedor de los botones */}
      <div className="button-container">
        {/* Botón de guardar */}
        <button type="submit" className="custom-btn add-btn">
          Guardar
        </button>
        {/* Botón de cancelar */}
        <button type="button" onClick={handleCancel} className="custom-btn cancel-btn">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
