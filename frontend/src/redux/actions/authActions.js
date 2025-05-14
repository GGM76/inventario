import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // Usamos una constante para la URL base

// Acción de login
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: 'LOGIN_REQUEST' });

    const response = await axios.post(`${API_URL}/login`, { email, password });

    // Acceder a los datos de usuario y token desde la respuesta
    const { token, userInfo } = response.data; // Extraemos el token y el objeto userInfo

    // Verificamos que tenemos la información del usuario
    if (!userInfo || !userInfo.role) {
      throw new Error("Datos del usuario incompletos.");
    }

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { token, userInfo },  // Guardamos tanto el token como los datos del usuario
    });

    return { token, userInfo };  // Devolvemos los datos al frontend

  } catch (error) {
    console.error('Error en login:', error);
    dispatch({
      type: 'LOGIN_FAIL',
      payload: error.response ? error.response.data.message : error.message,
    });
    throw error;  // Lanza el error para que el frontend lo maneje
  }
};

// Acción de registro
export const register = (email, password, role, empresa_id) => async (dispatch) => {  // Cambié 'empresa' por 'empresa_id'
  try {
    dispatch({ type: 'REGISTER_REQUEST' });

    // Verifica que los datos sean enviados de forma correcta (sin anidar)
    const response = await axios.post(
      `${API_URL}/roomies/register`,
      { email, password, role, empresa_id },  // Cambié 'empresa' por 'empresa_id'
      {
        headers: {
          'Content-Type': 'application/json', // Asegura que el contenido se envíe como JSON
        },
      }
    );

    dispatch({ type: 'REGISTER_SUCCESS' });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    dispatch({
      type: 'REGISTER_FAIL',
      payload: error.response ? error.response.data.message : error.message,
    });
    throw new Error(errorMessage);
  }
};

// Acción de logout
export const logout = () => (dispatch) => {
  // Eliminar el token y la información de usuario del localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmpresaId');  // Cambié 'userEmpresa' por 'userEmpresaId'

  // Disparar acción para eliminar la sesión en Redux
  dispatch({ type: 'LOGOUT' });
};
