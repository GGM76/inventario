// src/components/BodegaFormModal.jsx
import React, { useState } from 'react';

const BodegaFormModal = ({ onClose, onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('authToken');
  const userEmpresaId = localStorage.getItem('userEmpresaId');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !ubicacion) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/roomies/bodegas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          ubicacion,
          empresa_id: userEmpresaId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Hubo un error al agregar la bodega.');
      }
    } catch (err) {
      setError('Hubo un error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Agregar Bodega</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Ubicación</label>
                <input
                  type="text"
                  className="form-control"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Cargando...' : 'Agregar Bodega'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BodegaFormModal;
