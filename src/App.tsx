import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PedidosPage from './app/pedidos/index'
import ProduccionPage from './app/produccion/index'
import ProgramasPage from './app/programas/index'
import LoginPage from './app/login/index' // 1. Importamos la página de Login
import { useAuth } from './lib/auth/AuthContext' // 2. Importamos el hook de autenticación

function App() {
  // 3. Obtenemos la sesión (o null) de nuestro AuthContext
  const { session } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* 4. Lógica condicional */}
          {!session ? (
            // Si NO hay sesión, cualquier ruta (path="*")
            // mostrará la página de Login.
            <Route path="*" element={<LoginPage />} />
          ) : (
            // Si HAY sesión, mostramos las rutas de la aplicación
            <>
              <Route path="/" element={<PedidosPage />} />
              <Route path="/pedidos" element={<PedidosPage />} />
              <Route path="/produccion" element={<ProduccionPage />} />
              <Route path="/programas" element={<ProgramasPage />} />
              
              {/* Ruta de fallback: si un usuario logueado va a /login, lo mandamos a Pedidos */}
              <Route path="/login" element={<PedidosPage />} /> 
            </>
          )}
        </Routes>
      </div>
    </Router>
  )
}

export default App
