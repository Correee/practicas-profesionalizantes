import { useState } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { StoreFooter } from '../components/StoreFooter'
import '../css/Login/Login.css'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const SESSION_KEY = 'reinaMadreAuth'

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* Storage may be disabled. */ }
  try { sessionStorage.removeItem(SESSION_KEY) } catch { /* Storage may be disabled. */ }
}

function getSavedSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!saved) return null

    const session = JSON.parse(saved)
    if (!session.token || !session.usuario?.email) throw new Error('Sesión inválida')

    const tokenParts = session.token.split('.')
    if (tokenParts.length !== 3) throw new Error('Token inválido')

    const payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')
    const tokenData = JSON.parse(atob(paddedPayload))

    if (typeof tokenData.exp !== 'number' || tokenData.exp * 1000 <= Date.now()) {
      clearSession()
      return null
    }

    return session
  } catch {
    clearSession()
    return null
  }
}

function LoginForm({ emailInicial, onLogin, onRegister }) {
  const [email, setEmail] = useState(emailInicial)
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) throw new Error(data.mensaje || 'No se pudo iniciar sesión.')
      if (!data.token || !data.usuario?.email) throw new Error('El servidor no devolvió los datos de sesión.')

      onLogin(data, rememberMe)
      setPassword('')
      setMessage('Sesión iniciada correctamente.')
    } catch (error) {
      setMessage(error.message || 'No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-card" id="login" aria-labelledby="form-title">
      <p className="eyebrow">Tu cuenta personal</p>
      <h1 id="form-title">Qué lindo tenerte<br />de vuelta</h1>
      <p className="login-intro">Ingresá a tu cuenta para continuar donde lo dejaste.</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-field">
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="form-field">
          Contraseña
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingresá tu contraseña"
            required
            type="password"
            value={password}
          />
        </label>

        <label className="remember-option">
          <input checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} type="checkbox" />
          <span>Recordarme en este dispositivo</span>
        </label>

        {message && <p className="form-message" role="status">{message}</p>}

        <button className="submit-button" disabled={loading} type="submit">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <div className="signup-prompt">
        <span>¿Todavía no tenés una cuenta?</span>
        <button className="text-link" onClick={onRegister} type="button">Crear cuenta</button>
      </div>
    </section>
  )
}

function RegisterForm({ onCancel, onRegistered }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (password !== confirmation) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    if (new TextEncoder().encode(password).length > 72) {
      setMessage('La contraseña no puede superar los 72 bytes.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) throw new Error(data.mensaje || 'No se pudo crear la cuenta.')
      onRegistered(email.trim().toLowerCase())
    } catch (error) {
      setMessage(error.message || 'No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-card" id="login" aria-labelledby="form-title">
      <p className="eyebrow">Reina Madre</p>
      <h1 id="form-title">Creá tu cuenta</h1>
      <p className="login-intro">Completá tus datos para registrarte.</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-field">
          Email
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" required type="email" value={email} />
        </label>
        <label className="form-field">
          Contraseña
          <input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" required type="password" value={password} />
        </label>
        <label className="form-field">
          Repetir contraseña
          <input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repetí tu contraseña" required type="password" value={confirmation} />
        </label>

        {message && <p className="form-message" role="alert">{message}</p>}

        <button className="submit-button" disabled={loading} type="submit">
          {loading ? 'Creando cuenta…' : 'Registrarse'}
        </button>
      </form>

      <div className="signup-prompt">
        <span>¿Ya tenés una cuenta?</span>
        <button className="text-link" onClick={onCancel} type="button">Iniciar sesión</button>
      </div>
    </section>
  )
}

function Login() {
  const [session, setSession] = useState(getSavedSession)
  const [formMode, setFormMode] = useState('login')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [message, setMessage] = useState('')

  function handleLogin(data, rememberMe) {
    const newSession = { token: data.token, usuario: data.usuario }
    clearSession()
    setSession(newSession)

    try {
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem(SESSION_KEY, JSON.stringify(newSession))
    } catch {
      // The session stays active until this page is closed.
    }
  }

  function handleLogout() {
    clearSession()
    setSession(null)
  }

  function showLogin() {
    setFormMode('login')
    setMessage('')
  }

  function showRegister() {
    setFormMode('register')
    setMessage('')
  }

  function finishRegistration(email) {
    setRegisteredEmail(email)
    setFormMode('login')
    setMessage('Cuenta creada. Iniciá sesión para continuar.')
  }

  return (
    <div className="login-page">
      <BrandHeader session={session} onLogin={showLogin} onLogout={handleLogout} onRegister={showRegister} />
      <main className="login-main">
        <div className="login-layout">
          <aside className="welcome-panel">
            <span className="welcome-kicker"><span /> Un espacio para vos</span>
            <h2>Volvé a encontrar eso que te gusta.</h2>
            <p>Iniciá sesión para continuar tu recorrido y tener todo en un mismo lugar.</p>
            <span className="welcome-signature">Qué bueno verte <span>♡</span></span>
          </aside>

          {formMode === 'login' ? (
            <LoginForm emailInicial={registeredEmail} onLogin={handleLogin} onRegister={showRegister} />
          ) : (
            <RegisterForm onCancel={showLogin} onRegistered={finishRegistration} />
          )}
        </div>
        {message && <p className="form-message success register-message" role="status">{message}</p>}
      </main>
      <StoreFooter />
    </div>
  )
}

export { Login }
