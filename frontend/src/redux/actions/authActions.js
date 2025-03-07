// src/redux/actions/authActions.js
import axios from 'axios';

export const login = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post('http://localhost:5000/api/login', {
      email,
      password,
    });
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: response.data,
    });
    localStorage.setItem('token', response.data.token); // Guardamos el token en localStorage
  } catch (error) {
    dispatch({
      type: 'LOGIN_FAIL',
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};

export const register = (email, password, role,empresa_id) => async (dispatch) => {
  try {
    await axios.post('http://localhost:5000/api/register', { email, password, role,empresa_id });
    dispatch({ type: 'REGISTER_SUCCESS' });
  } catch (error) {
    console.error('Error en registro', error);
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem('token');
  dispatch({
    type: 'LOGOUT',
  });
};
