
import { Login } from './pages/Login'
import './App.css'

function App() {
  const path = window.location.pathname

  if (path === '/login') {
    return <Login />
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

