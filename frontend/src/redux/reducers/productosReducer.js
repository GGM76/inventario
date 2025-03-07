// src/redux/reducers/productosReducer.js
const initialState = {
    productos: [],
    loading: false,
    error: null,
  };
  
  const productosReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'GET_PRODUCTOS_SUCCESS':
        return {
          ...state,
          productos: action.payload,
          loading: false,
        };
      case 'GET_PRODUCTOS_FAIL':
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      default:
        return state;
    }
  };
  
  export default productosReducer;
  