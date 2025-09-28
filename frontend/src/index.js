import React from 'react';
import { createRoot } from 'react-dom/client'; // React 19 සඳහා නව import
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>
);