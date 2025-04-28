// src/redux/actions/productosActions.js
import axios from 'axios';

export const getProductos = (empresa_id) => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/productos/${empresa_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({
      type: 'GET_PRODUCTOS_SUCCESS',
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: 'GET_PRODUCTOS_FAIL',
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};
