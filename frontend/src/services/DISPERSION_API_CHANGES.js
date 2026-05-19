// frontend/src/services/dispersionAPI.js
// Documentación de cambios en la API de Dispersión

/**
 * CAMBIOS EN LA DISPERSIÓN
 * 
 * 1. VALIDACIÓN DE CANTIDADES (NUEVO)
 *    Antes: Se creaba la dispersión sin validar si había suficientes cantidades
 *    Ahora: Se valida ANTES de crear la dispersión
 *    
 *    Si hay error: Devuelve 400 con detalles específicos
 *    {
 *      error: "Error de validación en las cantidades del archivo.",
 *      advertencia: "No se pudo procesar la dispersión porque hay inconsistencias:",
 *      detalles: [
 *        "Error en producto 'Producto A': intenta usar 100 unidades pero solo hay 50 disponibles."
 *      ]
 *    }
 *
 * 2. DESCUENTO AUTOMÁTICO DE PRODUCTOS (NUEVO)
 *    Antes: No se descontaban los productos del proyecto
 *    Ahora: Después de validación exitosa, se descuentan automáticamente
 *    
 *    Cambios en el proyecto:
 *    - cantidadTotal: Se reduce por la cantidad dispersada
 *    - cantidadReservada: Se incrementa (registra qué fue reservado)
 *
 * 3. ESTADO DE DISPERSIÓN (MODIFICADO)
 *    Antes: estado = 'registrado'
 *    Ahora: estado = 'completada' (cuando se descuenta exitosamente)
 *    
 *    Esto permite:
 *    - Saber si se pueden restaurar cantidades al eliminar
 *    - Auditoría de qué dispersiones fueron procesadas
 *
 * 4. ELIMINACIÓN CON RESTAURACIÓN (MEJORADO)
 *    Antes: Se eliminaba sin restaurar cantidades
 *    Ahora: Si estado es 'completada', restaura cantidades al proyecto
 *    
 *    Cambios al eliminar:
 *    - cantidadTotal: Se incrementa (restaura cantidad)
 *    - cantidadReservada: Se decrementa
 */

// EJEMPLO DE USO EN FRONTEND

// 1. Cargar dispersión
async function createDispersion(projectId, metadata, productosDelArchivo) {
  try {
    const response = await fetch(
      `/api/dispersion/projects/${projectId}/mass-use`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata, productos: productosDelArchivo })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      
      // IMPORTANTE: Ahora hay un campo "detalles" con lista de errores
      if (errorData.detalles && Array.isArray(errorData.detalles)) {
        // Mostrar cada error específico al usuario
        const mensajeError = errorData.detalles.join('\n');
        console.error('Errores de validación:\n', mensajeError);
        
        // Mostrar en UI (ejemplo):
        // alert(`${errorData.advertencia}\n\n${mensajeError}`);
        
        return { success: false, errors: errorData.detalles };
      }
      
      throw new Error(errorData.error);
    }

    const data = await response.json();
    console.log('Dispersión creada exitosamente:', data.dispersionId);
    return { success: true, dispersionId: data.dispersionId };
    
  } catch (error) {
    console.error('Error al crear dispersión:', error);
    return { success: false, error: error.message };
  }
}

// 2. Eliminar dispersión (ahora restaura cantidades)
async function deleteDispersion(dispersionId) {
  try {
    const response = await fetch(
      `/api/dispersion/dispersiones/${dispersionId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error('No se pudo eliminar la dispersión');
    }

    const data = await response.json();
    console.log(data.message);
    
    // Si hay campo "detalles", significa que se restauraron cantidades
    if (data.detalles) {
      console.log('Notificación:', data.detalles);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Error al eliminar dispersión:', error);
    return { success: false, error: error.message };
  }
}

// 3. Componente para mostrar errores de dispersión
function MostrarErroresDispersion({ errores }) {
  if (!errores || errores.length === 0) return null;

  return (
    <div className="alert alert-danger">
      <h5>⚠️ No se pudo procesar el archivo</h5>
      <p>Hay inconsistencias en las cantidades:</p>
      <ul>
        {errores.map((error, idx) => (
          <li key={idx}>{error}</li>
        ))}
      </ul>
      <p className="mb-0">
        <small>Por favor, revisa los datos del archivo y vuelve a intentar.</small>
      </p>
    </div>
  );
}
