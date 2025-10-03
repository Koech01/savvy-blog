import './App.css';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './components/Auth/authContext';


const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);