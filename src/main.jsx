
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './env-config.js'; // Import environment configuration
import { SESSION_SECURITY } from './lib/security.js';

SESSION_SECURITY.setupSessionClearance();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
