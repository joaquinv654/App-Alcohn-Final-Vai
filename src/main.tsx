import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './lib/auth/AuthContext.tsx' // 1. Importar

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* 2. Envolver la App */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
