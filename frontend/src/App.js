import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Dashboard from './components/Dashboard';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute'; // Importamos PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/roomies/about" element={<About />} />
        <Route path="/roomies/users/login" element={<Login />} /> 
        <PrivateRoute path="/dashboard" element={<Dashboard />} /> 
        <Route path="/roomies/productos" element={<ProductForm />} />
        <Route path="/roomies/productos/:id" element={<ProductForm />} />
        <Route path="/roomies/productos" element={<ProductList />} />
      </Routes>
    </Router>
  );
}

export default App;
