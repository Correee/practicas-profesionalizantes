
import { Login } from './pages/Login'
import { Catalogo } from './pages/Catalogo'
import { AdminDashboard } from './pages/AdminDashboard'
import Home from './pages/Home'
import { Nosotros } from './pages/Nosotros'
import './App.css'

function App() {
  const path = window.location.pathname

  if (path === '/' || path === '/inicio') {
    return <Home />
  }

  if (path === '/nosotros') {
    return <Nosotros />
  }

  if (path === '/login') {
    return <Login />
  }

  if (path === '/catalogo') {
    return <Catalogo />
  }

  if (path === '/admin') {
    return <AdminDashboard />
  }

  return (
    <main className="not-found-page">
      <h1>Esta página todavía no está disponible</h1>
      <p>No encontramos una página creada para esta ruta.</p>
      <a href="/">Volver al inicio</a>
    </main>
  )
}

export default App

