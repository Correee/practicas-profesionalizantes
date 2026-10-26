import { useEffect, useState } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { StoreFooter } from '../components/StoreFooter'
import '../css/Login/Login.css'
import '../css/Catalogo/Catalogo.css'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const SESSION_KEY = 'reinaMadreAuth'

const TINTES = ['#fbe7e4', '#e6f2e6', '#e3f0f4', '#f0e9f6', '#fcf3d8']

const precioFormateado = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

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

function ProductoCard({ producto, tinte }) {
  const sinStock = Number(producto.stock) <= 0

  return (
    <article className={`product-card${sinStock ? ' agotado' : ''}`}>
      <div className="product-visual" style={{ background: tinte }} aria-hidden="true">
        <span>✿</span>
      </div>

      <div className="product-body">
        <h2 className="product-name">{producto.nombre}</h2>

        {producto.descripcion ? (
          <p className="product-description">{producto.descripcion}</p>
        ) : null}

        <div className="product-meta">
          <span className="product-price">{precioFormateado.format(producto.precio)}</span>
          <span className={`stock-chip${sinStock ? ' out' : ''}`}>
            {sinStock ? 'Sin stock' : 'En stock'}
          </span>
        </div>
      </div>
    </article>
  )
}

function Catalogo() {
  const [session, setSession] = useState(getSavedSession)
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    async function cargarProductos() {
      try {
        const response = await fetch(`${API_URL}/productos`, { signal: controlador.signal })
        const data = await response.json().catch(() => ({}))

        if (!response.ok) throw new Error(data.mensaje || 'No se pudieron cargar los productos.')
        if (!Array.isArray(data)) throw new Error('Respuesta inesperada del servidor.')

        setProductos(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    cargarProductos()
    return () => controlador.abort()
  }, [])

  function irALogin() {
    window.location.href = '/login'
  }

  function irARegistro() {
    window.location.href = '/login?modo=registro'
  }

  function cerrarSesion() {
    clearSession()
    setSession(null)
    window.location.href = '/login'
  }

  const terminoBusqueda = busqueda.trim().toLowerCase()

  const productosFiltrados = terminoBusqueda
    ? productos.filter((producto) =>
        `${producto.nombre ?? ''} ${producto.descripcion ?? ''}`.toLowerCase().includes(terminoBusqueda),
      )
    : productos

  return (
    <div className="catalogo-page">
      <BrandHeader session={session} onLogin={irALogin} onRegister={irARegistro} onLogout={cerrarSesion} />

      <main className="catalogo-main">
        <section className="catalogo-head">
          <p className="catalogo-kicker">Nuestro catálogo</p>
          <h1>Piezas hechas con intención</h1>
          <p className="catalogo-intro">
            Macramé e impresión 3D para decorar, regalar y habitar tus espacios.
          </p>

          <label className="catalog-search">
            Buscar producto
            <input
              type="search"
              placeholder="Buscar por nombre…"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </label>
        </section>

        {cargando ? (
          <p className="catalog-state" role="status">Cargando productos…</p>
        ) : error ? (
          <p className="catalog-state error" role="alert">{error}</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="catalog-state">
            {terminoBusqueda
              ? 'No encontramos productos que coincidan con tu búsqueda.'
              : 'Todavía no hay productos publicados.'}
          </p>
        ) : (
          <div className="catalog-grid">
            {productosFiltrados.map((producto, indice) => (
              <ProductoCard
                key={producto.id ?? indice}
                producto={producto}
                tinte={TINTES[indice % TINTES.length]}
              />
            ))}
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  )
}

export { Catalogo }
