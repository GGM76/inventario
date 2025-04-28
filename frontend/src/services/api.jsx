const API_BASE_URL = process.env.REACT_APP_API_URL;

export const fetchProductos = async (token) => {
  const response = await fetch(`${API_BASE_URL}/roomies/products`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await response.json();
};

export const fetchBodegas = async (token) => {
  const response = await fetch(`${API_BASE_URL}/roomies/bodegas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await response.json();
};

export const addProductToBodega = async (productoId, bodegaId, cantidad, token) => {
  const response = await fetch(`${API_BASE_URL}/roomies/addProductToBodega`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ productoId, bodegaId, cantidad }),
  });
  return await response.json();
};
