import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { HelmetProvider } from 'react-helmet-async';   // ✅ 추가

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>        {/* ✅ App을 HelmetProvider로 감싸기 */}
    <App />
  </HelmetProvider>
);
