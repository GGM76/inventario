// src/redux/reducers/productReducers.js

export const fetchProductsReducers = (state, action) => {
  state.loading = false;
  // Aseguramos que la respuesta sea válida
  if (Array.isArray(action.payload)) {
    state.products = action.payload;  // Si la respuesta es un array de productos
  } else {
    state.products = [];  // Si no es un array, asignamos un array vacío
  }
};


export const fetchProductsPending = (state) => {
  state.loading = true;
};

export const fetchProductsRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

export const addProductReducers = (state, action) => {
  state.loading = false;
  state.products.push(action.payload);
};

export const addProductPending = (state) => {
  state.loading = true;
};

export const addProductRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

export const editProductReducers = (state, action) => {
  state.loading = false;
  const index = state.products.findIndex((product) => product.id === action.payload.id);
  if (index !== -1) {
      state.products[index] = action.payload;
  }
};

export const editProductPending = (state) => {
  state.loading = true;
};

export const editProductRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

export const deleteProductReducers = (state, action) => {
  state.loading = false;
  state.products = state.products.filter((product) => product.id !== action.payload);
};

export const deleteProductPending = (state) => {
  state.loading = true;
};

export const deleteProductRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};
