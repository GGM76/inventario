// src/redux/reducers/authReducer.js
const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  };
  
  const authReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'LOGIN_SUCCESS':
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          loading: false,
        };
      case 'LOGIN_FAIL':
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      case 'LOGOUT':
        return {
          ...state,
          user: null,
          token: null,
        };
      default:
        return state;
    }
  };
  
  export default authReducer;
  