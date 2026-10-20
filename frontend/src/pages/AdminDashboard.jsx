import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { StoreFooter } from '../components/StoreFooter'
import '../css/Login/Login.css'
import '../css/Dashboard/AdminDashboard.css'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const SESSION_KEY = 'reinaMadreAuth'
const FORM_VACIO = { nombre: '', descripcion: '', precio: '', stock: '' }
const PRECIO = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })

function borrarSesion() {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* El almacenamiento puede estar deshabilitado. */ }
  try { sessionStorage.removeItem(SESSION_KEY) } catch { /* El almacenamiento puede estar deshabilitado. */ }
}

function leerSesion() {
  try {
    const guardada = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!guardada) return null
    const sesion = JSON.parse(guardada)
    const partes = sesion.token?.split('.')
    if (!sesion.token || !sesion.usuario?.email || partes?.length !== 3) return null
    const payload = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const datos = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')))
    if (typeof datos.exp !== 'number' || datos.exp * 1000 <= Date.now()) return null
    return sesion
  } catch {
    return null
  }
}

function AdminDashboard() {
  const [sesion] = useState(leerSesion)
  const token = sesion?.token
  const [productos, setProductos] = useState([])
  const [formulario, setFormulario] = useState(FORM_VACIO)
  const [productoEditando, setProductoEditando] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const cerrarSesion = useCallback(() => {
    borrarSesion()
    window.location.href = '/login'
  }, [])

  const manejarErrorAuth = useCallback((status) => {
    if (status === 401 || status === 403) {
      borrarSesion()
      window.location.href = '/login'
    }
  }, [])

  const cargarProductos = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/admin/panel`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) {
        manejarErrorAuth(respuesta.status)
        throw new Error(datos.mensaje || 'No se pudieron cargar los productos.')
      }
      setProductos(Array.isArray(datos) ? datos : [])
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }, [manejarErrorAuth, token])

  useEffect(() => {
    if (!sesion || sesion.usuario?.rol !== 'Admin') {
      window.location.replace('/login')
      return
    }
    // La carga actualiza estado cuando finaliza la solicitud de red, no durante este efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarProductos()
  }, [cargarProductos, sesion])

  const resumen = useMemo(() => ({
    cantidad: productos.length,
    unidades: productos.reduce((total, producto) => total + (Number(producto.stock) || 0), 0),
    agotados: productos.filter((producto) => Number(producto.stock) <= 0).length,
  }), [productos])

  function cambiarCampo(evento) {
    setFormulario((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
  }

  function iniciarEdicion(producto) {
    setProductoEditando(producto)
    setFormulario({
      nombre: producto.nombre ?? '',
      descripcion: producto.descripcion ?? '',
      precio: String(producto.precio ?? ''),
      stock: String(producto.stock ?? ''),
    })
    setAviso('')
    setError('')
    document.getElementById('admin-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function cancelarEdicion() {
    setProductoEditando(null)
    setFormulario(FORM_VACIO)
    setError('')
  }

  async function guardarProducto(evento) {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    setAviso('')
    const editando = productoEditando !== null
    const id = productoEditando?.id ?? productoEditando?.producto_id

    try {
      const respuesta = await fetch(editando ? `${API_URL}/admin/panel/${id}` : `${API_URL}/admin/panel`, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sesion.token}` },
        body: JSON.stringify({
          nombre: formulario.nombre,
          descripcion: formulario.descripcion,
          precio: formulario.precio,
          stock: formulario.stock,
        }),
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) {
        manejarErrorAuth(respuesta.status)
        throw new Error(datos.mensaje || 'No se pudo guardar el producto.')
      }
      cancelarEdicion()
      setAviso(editando ? 'Producto actualizado.' : 'Producto agregado al catálogo.')
      await cargarProductos()
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarProducto(producto) {
    const id = producto.id ?? producto.producto_id
    if (!id || !window.confirm(`¿Eliminar “${producto.nombre}” del catálogo? Esta acción no se puede deshacer.`)) return
    setError('')
    setAviso('')
    try {
      const respuesta = await fetch(`${API_URL}/admin/panel/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sesion.token}` },
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) {
        manejarErrorAuth(respuesta.status)
        throw new Error(datos.mensaje || 'No se pudo eliminar el producto.')
      }
      if (productoEditando?.id === id || productoEditando?.producto_id === id) cancelarEdicion()
      setAviso('Producto eliminado del catálogo.')
      await cargarProductos()
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.')
    }
  }

  if (!sesion || sesion.usuario?.rol !== 'Admin') return null

  return (
    <div className="admin-page">
      <BrandHeader session={sesion} onLogout={cerrarSesion} onLogin={() => { window.location.href = '/login' }} onRegister={() => { window.location.href = '/login' }} />

      <main className="admin-main">
        <section className="admin-heading">
          <p className="admin-eyebrow">Administración · Reina Madre</p>
          <div className="admin-title-row">
            <div>
              <h1>Panel de productos</h1>
              <p>Gestioná el catálogo y mantené tu tienda al día.</p>
            </div>
            <a className="admin-store-link" href="/catalogo">Ver tienda <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="admin-stats" aria-label="Resumen del inventario">
          <article className="admin-stat"><span>Productos publicados</span><strong>{resumen.cantidad}</strong><small>en el catálogo</small></article>
          <article className="admin-stat"><span>Unidades disponibles</span><strong>{resumen.unidades}</strong><small>suma de todo el stock</small></article>
          <article className="admin-stat"><span>Sin stock</span><strong>{resumen.agotados}</strong><small>productos para revisar</small></article>
        </section>

        <div className="admin-content-grid">
          <section className="admin-card admin-form-card" id="admin-product-form">
            <div className="admin-card-heading">
              <div><p className="admin-eyebrow">Catálogo</p><h2>{productoEditando ? 'Editar producto' : 'Agregar producto'}</h2></div>
              {productoEditando && <button className="admin-cancel-link" onClick={cancelarEdicion} type="button">Cancelar edición</button>}
            </div>
            <form className="admin-product-form" onSubmit={guardarProducto}>
              <label>Nombre<input maxLength="120" name="nombre" onChange={cambiarCampo} placeholder="Ej. Florero Aura" required value={formulario.nombre} /></label>
              <label>Descripción<textarea maxLength="1000" name="descripcion" onChange={cambiarCampo} placeholder="Contá brevemente qué lo hace especial" rows="4" value={formulario.descripcion} /></label>
              <div className="admin-form-row">
                <label>Precio<input min="0" name="precio" onChange={cambiarCampo} placeholder="0" required step="0.01" type="number" value={formulario.precio} /></label>
                <label>Stock<input min="0" name="stock" onChange={cambiarCampo} placeholder="0" required step="1" type="number" value={formulario.stock} /></label>
              </div>
              {error && <p className="admin-message error" role="alert">{error}</p>}
              {aviso && <p className="admin-message success" role="status">{aviso}</p>}
              <button className="admin-primary-button" disabled={guardando} type="submit">
                {guardando ? 'Guardando…' : productoEditando ? 'Guardar cambios' : 'Publicar producto'}
              </button>
            </form>
          </section>

          <section className="admin-card admin-list-card">
            <div className="admin-card-heading">
              <div><p className="admin-eyebrow">Inventario</p><h2>Productos de la tienda</h2></div>
              <button className="admin-refresh-button" disabled={cargando} onClick={() => { setCargando(true); setError(''); cargarProductos() }} type="button" aria-label="Actualizar lista">↻</button>
            </div>
            {cargando ? <p className="admin-empty-state">Cargando productos…</p> : error && productos.length === 0 ? <p className="admin-empty-state admin-error-text" role="alert">{error}</p> : productos.length === 0 ? <p className="admin-empty-state">Todavía no hay productos. Agregá el primero desde el formulario.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th><span className="visually-hidden">Acciones</span></th></tr></thead>
                  <tbody>{productos.map((producto, indice) => {
                    const id = producto.id ?? producto.producto_id ?? `${producto.nombre}-${indice}`
                    return <tr key={id}>
                      <td><strong>{producto.nombre}</strong><span>{producto.descripcion || 'Sin descripción'}</span></td>
                      <td className="admin-price">{PRECIO.format(Number(producto.precio) || 0)}</td>
                      <td><span className={`admin-stock${Number(producto.stock) <= 0 ? ' empty' : ''}`}>{Number(producto.stock) <= 0 ? 'Agotado' : `${producto.stock} un.`}</span></td>
                      <td><div className="admin-actions"><button onClick={() => iniciarEdicion(producto)} type="button">Editar</button><button className="delete" onClick={() => eliminarProducto(producto)} type="button">Eliminar</button></div></td>
                    </tr>
                  })}</tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}

export { AdminDashboard }
