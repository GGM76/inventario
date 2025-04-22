//src/redux/reducers/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    fetchProductsReducers, 
    fetchProductsPending, 
    fetchProductsRejected, 
    addProductReducers, 
    addProductPending, 
    addProductRejected, 
    editProductReducers, 
    editProductPending, 
    editProductRejected, 
    deleteProductReducers, 
    deleteProductPending, 
    deleteProductRejected 
} from './productReducers';  // Importamos los reducers desde el archivo separado

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (newProduct) => {
    const response = await fetch('http://localhost:8000/roomies/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Error al agregar el producto');
    }
    return await response.json();
  }
);

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async (updatedProduct) => {
    const response = await fetch(`http://localhost:8000/roomies/products/${updatedProduct.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProduct),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Error al editar el producto');
    }
    return await response.json();
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId) => {
    const response = await fetch(`http://localhost:8000/roomies/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el producto');
    }
    return productId;  // Regresamos el ID del producto eliminado
  }
);

// Acción para obtener productos desde el backend
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (companyId) => {
    const userCompany = String(localStorage.getItem('userEmpresaId')); // Asegúrate de convertirlo a una cadena
    const response = await fetch(`http://localhost:8000/roomies/products?empresa_id=${userCompany}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    });
    if (response.ok) {
      const data = await response.json();
      return data || [] ;  // Retorna los productos del backend
    } else {
        throw new Error('Error al obtener productos');
    }
});

// Acción para obtener la cantidad total de un producto
export const fetchProductTotalQuantity = createAsyncThunk(
    'products/fetchProductTotalQuantity',
    async ({ productoId, empresaId }) => {
        const response = await fetch(`http://localhost:8000/roomies/product-total-quantity?productoId=${productoId}&empresa_id=${empresaId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener la cantidad total del producto');
        }

        const data = await response.json();  // Aquí recibimos la cantidad total del producto
        return data;  // Devolvemos el objeto { totalQuantity }
    }
);  


// Crear el slice
const productSlice = createSlice({
  name: 'products',
  initialState: {
      products: [],
      loading: false,
      loadingQuantities: false, // Agregamos estado para la carga de cantidades totales
      error: null,
      productTotalQuantity: null,
  },
  reducers: {
      setProducts: (state, action) => {
          state.products = action.payload;
      },
  },
  extraReducers: (builder) => {
      builder
            // Reducers para obtener productos
            .addCase(fetchProducts.pending, fetchProductsPending)
            .addCase(fetchProducts.fulfilled, fetchProductsReducers)
            .addCase(fetchProducts.rejected, fetchProductsRejected)

            // Reducers para agregar productos
            .addCase(addProduct.pending, addProductPending)
            .addCase(addProduct.fulfilled, addProductReducers)
            .addCase(addProduct.rejected, addProductRejected)

            // Reducers para editar productos
            .addCase(editProduct.pending, editProductPending)
            .addCase(editProduct.fulfilled, editProductReducers)
            .addCase(editProduct.rejected, editProductRejected)

            // Reducers para eliminar productos
            .addCase(deleteProduct.pending, deleteProductPending)
            .addCase(deleteProduct.fulfilled, deleteProductReducers)
            .addCase(deleteProduct.rejected, deleteProductRejected)

            .addCase(fetchProductTotalQuantity.pending, (state) => {
              state.loadingQuantities = true; // Cambiar el estado cuando estamos cargando las cantidades
          })
          .addCase(fetchProductTotalQuantity.fulfilled, (state, action) => {
              const { productoId, totalQuantity } = action.payload;
              const updatedProducts = state.products.map((product) => {
                  if (product.id === productoId) {
                      return { ...product, totalQuantity };
                  }
                  return product;
              });
              state.products = updatedProducts;
              state.loadingQuantities = false; // Terminar la carga de cantidades
          })
          .addCase(fetchProductTotalQuantity.rejected, (state, action) => {
              state.loadingQuantities = false;
              state.error = action.error.message;
          });
    },
});
// Definimos la acción setProducts en reducers
export const { setProducts } = productSlice.actions;

export default productSlice.reducer;
