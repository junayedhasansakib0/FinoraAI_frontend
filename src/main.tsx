import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { installAuthInterceptor } from './api/interceptors';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Mount failed: #root is missing from index.html.');
}

// Installed once, before anything can issue a request, so every 401 gets one silent retry.
installAuthInterceptor();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
