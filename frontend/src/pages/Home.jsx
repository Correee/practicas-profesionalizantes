
import { useEffect, useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { StoreFooter } from "../components/StoreFooter";
import "../css/Inicio/Home.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
const SESSION_KEY = "reinaMadreAuth";

function cargarSesion() {
  try {
    const saved = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const session = JSON.parse(saved);
    const parts = session.token?.split(".");
    if (!session.usuario?.email || parts?.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")));
    return typeof data.exp === "number" && data.exp * 1000 > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function formatoPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(precio) || 0);
}

function Home() {
  const [session, setSession] = useState(cargarSesion);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function obtenerProductos() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(`${API_URL}/productos`, {
          signal: controlador.signal,
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los productos.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error("El servidor devolvió un formato inesperado.");
        }

        setProductos(datos.slice(0, 4));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "No pudimos cargar los productos. Intentá nuevamente más tarde."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    obtenerProductos();

    return () => controlador.abort();
  }, []);

  function irAProductos() {
    document.getElementById("productos")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function cerrarSesion() {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* El almacenamiento puede estar deshabilitado. */ }
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* El almacenamiento puede estar deshabilitado. */ }
    setSession(null);
  }

  return (
    <div className="home">
      <BrandHeader
        session={session}
        onLogin={() => { window.location.href = "/login"; }}
        onRegister={() => { window.location.href = "/login?modo=registro"; }}
        onLogout={cerrarSesion}
      />

      <main>
        <section className="home-hero">
          <div className="home-hero-contenido">
            <span className="home-etiqueta">
              CUIDADO · BIENESTAR · VOS
            </span>

            <h1>
              Sentite cómoda.
              <br />
              <em>Sentite vos.</em>
            </h1>

            <p>
              Descubrí productos pensados para acompañarte
              con comodidad, calidez y confianza en cada etapa.
            </p>

            <button
              className="home-boton"
              onClick={irAProductos}
              type="button"
            >
              Descubrir productos <span aria-hidden="true">→</span>
            </button>

            <div className="home-confianza">
              <span aria-hidden="true">✳</span>
              Una experiencia cercana, hecha para vos
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-circulo home-circulo-grande" />
            <div className="home-circulo home-circulo-chico" />
            <div className="home-tarjeta">
              <span className="home-tarjeta-simbolo">✳</span>
              <span className="home-tarjeta-titulo">Un momento para vos</span>
              <span className="home-tarjeta-linea" />
              <span className="home-tarjeta-subtitulo">
                Cuidado en cada detalle
              </span>
            </div>
            <span className="home-adorno home-adorno-uno">✳</span>
            <span className="home-adorno home-adorno-dos">✧</span>
          </div>
        </section>

        <section className="home-beneficios" id="nosotros">
          <article className="home-beneficio">
            <span className="home-beneficio-icono">♡</span>
            <div>
              <h3>Pensado para vos</h3>
              <p>Productos para acompañar tus necesidades.</p>
            </div>
          </article>

          <article className="home-beneficio">
            <span className="home-beneficio-icono">✳</span>
            <div>
              <h3>Calidez en cada detalle</h3>
              <p>Una experiencia simple y cercana.</p>
            </div>
          </article>

          <article className="home-beneficio">
            <span className="home-beneficio-icono">◇</span>
            <div>
              <h3>Elegí con confianza</h3>
              <p>Encontrá lo que estás buscando.</p>
            </div>
          </article>
        </section>

        <section className="home-productos" id="productos">
          <div className="home-seccion-encabezado">
            <div>
              <span className="home-etiqueta">NUESTRA SELECCIÓN</span>
              <h2>Productos para vos</h2>
              <p>Conocé lo que tenemos para ofrecerte.</p>
            </div>

            <a className="home-ver-mas" href="/catalogo">
              Explorar <span aria-hidden="true">→</span>
            </a>
          </div>

          {cargando && (
            <p className="home-mensaje">
              Cargando productos...
            </p>
          )}

          {!cargando && error && (
            <div className="home-mensaje home-error">
              <p>{error}</p>
              <button
                className="home-boton-secundario"
                type="button"
                onClick={() => window.location.reload()}
              >
                Volver a intentar
              </button>
            </div>
          )}

          {!cargando && !error && productos.length === 0 && (
            <p className="home-mensaje">
              Todavía no hay productos disponibles.
            </p>
          )}

          {!cargando && !error && productos.length > 0 && (
            <div className="home-productos-grid">
              {productos.map((producto) => (
                <article
                  className="home-producto"
                  key={producto.id}
                >
                  <div className="home-producto-imagen">
                    <span className="home-producto-monograma">
                      RM
                    </span>
                    <span className="home-producto-detalle">
                      REINA MADRE
                    </span>
                  </div>

                  <div className="home-producto-info">
                    <h3>{producto.nombre}</h3>

                    <p className="home-producto-descripcion">
                      {producto.descripcion ||
                        "Un producto pensado para vos."}
                    </p>

                    <div className="home-producto-pie">
                      <strong>
                        {formatoPrecio(producto.precio)}
                      </strong>

                      <span
                        className={
                          Number(producto.stock) > 0
                            ? "home-stock disponible"
                            : "home-stock agotado"
                        }
                      >
                        {Number(producto.stock) > 0
                          ? "Disponible"
                          : "Sin stock"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="home-cta">
          <div>
            <span className="home-etiqueta">ESTAMOS PARA ACOMPAÑARTE</span>
            <h2>Encontrá tu próximo favorito.</h2>
            <p>Ingresá a tu cuenta para continuar tu experiencia.</p>
          </div>

          <a className="home-boton home-boton-claro" href="/login">
            Ingresar a mi cuenta <span aria-hidden="true">→</span>
          </a>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}

export default Home;
