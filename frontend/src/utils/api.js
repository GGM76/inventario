const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/roomies';

const fetchFromApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ Error en la petición:', error);
    throw error;
  }
};

export const fetchProductos = () => fetchFromApi('/products');
export const fetchBodegas = () => fetchFromApi('/bodegas');
export const addProductToBodega = (productoId, bodegaId, cantidad) =>
  fetchFromApi('/addProductToBodega', {
    method: 'POST',
    body: JSON.stringify({ productoId, bodegaId, cantidad }),
  });
