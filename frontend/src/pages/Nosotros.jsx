import { useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { StoreFooter } from "../components/StoreFooter";
import "../css/Login/Login.css";
import "../css/Nosotros/Nosotros.css";

const SESSION_KEY = "reinaMadreAuth";

function leerSesion() {
  try {
    const guardada = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!guardada) return null;
    const sesion = JSON.parse(guardada);
    const partes = sesion.token?.split(".");
    if (!sesion.usuario?.email || partes?.length !== 3) return null;
    const payload = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const datos = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")));
    if (typeof datos.exp !== "number" || datos.exp * 1000 <= Date.now()) return null;
    return sesion;
  } catch {
    return null;
  }
}

function Nosotros() {
  const [session, setSession] = useState(leerSesion);

  function cerrarSesion() {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* El almacenamiento puede estar deshabilitado. */ }
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* El almacenamiento puede estar deshabilitado. */ }
    setSession(null);
  }

  return (
    <>
      <BrandHeader
        session={session}
        onLogin={() => {
          window.location.href = "/login";
        }}
        onRegister={() => {
          window.location.href = "/login?modo=registro";
        }}
        onLogout={cerrarSesion}
      />

      <main className="nosotros-page">
        <section className="nosotros-hero">
          <div className="nosotros-hero-content">
            <span className="nosotros-eyebrow">CONOCÉ NUESTRA ESENCIA</span>

            <h1>
              Los detalles hacen
              <span> la diferencia</span>
            </h1>

            <p>
              Creemos que un regalo es mucho más que un objeto: es una forma de
              acompañar, sorprender y estar cerca, incluso a la distancia.
            </p>

            <a href="/catalogo" className="nosotros-button">
              Descubrí nuestros productos
            </a>
          </div>

          <div className="nosotros-hero-decoration" aria-hidden="true">
            <span className="decoracion-flor">✿</span>
            <span className="decoracion-texto">Hecho para emocionar</span>
          </div>
        </section>

        <section className="nosotros-historia">
          <div className="nosotros-historia-label">
            <span>01</span>
            <p>NUESTRA HISTORIA</p>
          </div>

          <div className="nosotros-historia-content">
            <h2>
              Regalar es una forma
              <span> de decir lo que sentimos.</span>
            </h2>

            <p>
              En Reina Madre creemos en el valor de los pequeños gestos. Un
              ramo, un detalle inesperado o un mensaje especial pueden
              transformar un día común en un recuerdo inolvidable.
            </p>

            <p>
              Por eso buscamos que cada experiencia de regalo transmita cariño,
              dedicación y la intención de hacer sentir especial a alguien.
            </p>
          </div>
        </section>

        <section className="nosotros-valores">
          <div className="nosotros-section-heading">
            <span>LO QUE NOS REPRESENTA</span>
            <h2>Más que un regalo</h2>
            <p>
              Nos inspiran las emociones y las conexiones que creamos a través
              de cada detalle.
            </p>
          </div>

          <div className="nosotros-valores-grid">
            <article className="nosotros-valor-card">
              <span className="nosotros-valor-icono">♡</span>
              <h3>Hecho con cariño</h3>
              <p>
                Cada detalle tiene la intención de transmitir afecto y hacer
                sentir importante a quien lo recibe.
              </p>
            </article>

            <article className="nosotros-valor-card">
              <span className="nosotros-valor-icono">✿</span>
              <h3>Detalles especiales</h3>
              <p>
                Creemos que son las pequeñas cosas las que muchas veces generan
                los recuerdos más lindos.
              </p>
            </article>

            <article className="nosotros-valor-card">
              <span className="nosotros-valor-icono">♡</span>
              <h3>Cerca, incluso a la distancia</h3>
              <p>
                Un regalo puede acercar a las personas y expresar sentimientos
                cuando las palabras no alcanzan.
              </p>
            </article>
          </div>
        </section>

        <section className="nosotros-cierre">
          <span>UN DETALLE PUEDE CAMBIAR EL DÍA</span>
          <h2>
            Hay muchas formas de decir
            <span> “estoy pensando en vos”.</span>
          </h2>
          <a href="/catalogo" className="nosotros-button">
            Encontrá tu próximo regalo
          </a>
        </section>
      </main>

      <StoreFooter />
    </>
  );
}

export { Nosotros };
