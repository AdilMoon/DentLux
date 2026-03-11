import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global Error Caught:", { message, source, lineno, colno, error });
  return false;
};

window.onunhandledrejection = function (event) {
  console.error("Unhandled Rejection:", event.reason);
};

console.log("App starting initialization...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Could not find root element to mount to!");
  throw new Error("Could not find root element to mount to");
}

console.log("Root element found. Creating root...");

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log("Root created. Rendering app...");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Render called.");
} catch (err) {
  console.error("Error during initial render:", err);
}
