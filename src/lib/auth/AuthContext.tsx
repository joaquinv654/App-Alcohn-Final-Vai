import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient' // Importamos el cliente que creamos

// Definimos el tipo de datos para nuestro contexto
interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
}

// Creamos el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Creamos el "Proveedor" del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Intentar obtener la sesión actual al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Escuchar cambios en la autenticación (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // 3. Limpiar el listener al desmontar
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user,
    loading,
  }

  // Si está cargando, no mostramos nada aún (evita parpadeos)
  if (loading) {
    return null // O puedes poner un spinner de carga global aquí
  }

  // Devolvemos el contexto para que los componentes hijos puedan usarlo
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Creamos un "hook" personalizado para usar el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}