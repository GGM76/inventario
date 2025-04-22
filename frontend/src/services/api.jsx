export const fetchProductos = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/roomies/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al cargar productos:', error);
      throw error;
    }
  };
  
  export const fetchBodegas = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/roomies/bodegas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al cargar bodegas:', error);
      throw error;
    }
  };
  
  export const addProductToBodega = async (productoId, bodegaId, cantidad, token) => {
    try {
      const response = await fetch('http://localhost:8000/roomies/addProductToBodega', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productoId, bodegaId, cantidad }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error al agregar producto a bodega:', error);
      throw error;
    }
  };
  