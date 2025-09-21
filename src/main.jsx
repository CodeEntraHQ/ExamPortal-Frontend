import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initTheme } from './utils/theme.js';
import { NotificationProvider } from './contexts/NotificationContext.jsx';

// Initialize theme before rendering
initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StrictMode>
);
