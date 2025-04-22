import React from 'react';
import ReactDOM from 'react-dom/client'; // Cambiado de 'react-dom' a 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'; // Importar el enrutador de React Router
import { Provider } from 'react-redux'; // Proveedor de Redux
import { store } from './redux/store'; // El store de Redux
import './styles/index.css'; // Archivo de estilos globales
import App from './App'; // Componente principal
import 'bootstrap/dist/css/bootstrap.min.css';


// Crear el root con 'createRoot' de ReactDOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar la app dentro del root
root.render(
  <Provider store={store}>
    <Router> {/* Aquí se envuelve App con Router */}
      <App />
    </Router>
  </Provider>
);
