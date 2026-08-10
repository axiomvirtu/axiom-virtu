import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler to catch benign Vite HMR WebSocket disconnection errors
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    (event.reason.message?.includes('WebSocket') ||
      event.reason.toString?.().includes('WebSocket') ||
      event.reason === 'WebSocket closed without opened.')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

