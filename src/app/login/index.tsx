import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // Importamos nuestro cliente
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Usamos la función de Supabase para iniciar sesión
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        throw error
      }
      
      // Si el inicio de sesión es exitoso, el 'onAuthStateChange'
      // en nuestro AuthContext se encargará de todo automáticamente.
      
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión. Verifica tus credenciales.")
    } finally {
      setLoading(false)
    }
  }

  // --- Opcional: Función para crear un usuario ---
  // (Puedes descomentar esto y agregar un botón si necesitas registrar usuarios)
  // const handleSignUp = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setError(null)
  //   setLoading(true)
  //   try {
  //     const { error } = await supabase.auth.signUp({
  //       email: email,
  //       password: password,
  //     })
  //     if (error) throw error
  //     alert('¡Usuario creado! Revisa tu email para confirmar la cuenta.')
  //   } catch (error: any) {
  //     setError(error.message)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">App Interna</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
            
            {/* Descomenta esto para tener un botón de registro */}
            {/* <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={handleSignUp}>
              Registrarse (Solo la primera vez)
            </Button> */}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}