import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Aplica a classe 'light' ou 'dark' no html baseado no localStorage antes do render inicial
// para evitar FOUC (Flash of Unstyled Content) do tema.
const storedTheme = localStorage.getItem('rouletteTheme_v2');
if (storedTheme === '"dark"') { // Note: useLocalStorage stringifies values
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark'); // Default to light or remove if set otherwise
}


const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found. Make sure you have a <div id="root"></div> in your index.html.');
}
