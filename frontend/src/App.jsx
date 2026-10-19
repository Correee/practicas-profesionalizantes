
import { Login } from './pages/Login'
import { Nosotros } from './pages/Nosotros'
import './App.css'

function App() {
  const path = window.location.pathname

  if (path === '/' || path === '/login') {
    return <Login />
  }

  if (path === '/nosotros') {
    return <Nosotros />
  }

  return (
    <main className="not-found-page">
      <h1>Esta página todavía no está disponible</h1>
      <p>No encontramos una página creada para esta ruta.</p>
      <a href="/login">Volver al inicio de sesión</a>
    </main>
  )
}

export default App

