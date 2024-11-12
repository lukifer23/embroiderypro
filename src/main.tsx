import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { DesignProvider } from './contexts/DesignContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DesignProvider>
      <App />
    </DesignProvider>
  </React.StrictMode>
);