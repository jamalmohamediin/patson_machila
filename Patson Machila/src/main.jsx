import React from 'react';
import ReactDOM from 'react-dom/client';
import PatsonMachilaTemplate from '../PatsonMachilaTemplate'; // Adjust path as needed
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      })
      .catch((error) => {
        console.log('SW cleanup failed: ', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PatsonMachilaTemplate />
  </React.StrictMode>,
);
