// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/App.css';
import AppRoutes from './AppRoutes';

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;