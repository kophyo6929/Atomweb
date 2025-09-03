import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './i18n';
import { NotificationProvider } from './NotificationContext';

// --- RENDER APP --- //
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <LanguageProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </LanguageProvider>
      </React.StrictMode>
    );
} else {
    console.error("Fatal Error: Root container 'root' not found in the DOM.");
}