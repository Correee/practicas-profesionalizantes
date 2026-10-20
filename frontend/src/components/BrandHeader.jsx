import logoBlack from '../assets/logo-black.svg'

function BrandHeader({ session, onLogout, onRegister, onLogin }) {
  function closeMenu(event) {
    event.currentTarget.closest('details').open = false
  }

  return (
    <>
      <div className="announcement-bar">
        <span>Un detalle especial puede cambiar el día</span>
      </div>

      <header className="site-header">
        <a className="brand" href="/inicio" aria-label="Reina Madre, inicio">
          <img className="brand-logo" src={logoBlack} alt="Reina Madre" />
        </a>

        <nav className="main-nav" aria-label="Navegación principal">
          <a href="/inicio">Inicio</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/catalogo">Catálogo</a>
        </nav>

        <details className="profile-control">
          <summary className="profile-link">
            <span aria-hidden="true">♙</span>
            {session ? 'Mi perfil' : 'Perfil'}
            <span className="profile-chevron" aria-hidden="true">⌄</span>
          </summary>

          <div className="profile-menu">
            {session ? (
              <>
                <p className="profile-menu-heading">Sesión iniciada</p>
                <p className="profile-menu-email">{session.usuario.email}</p>
                <button className="profile-menu-action" onClick={(event) => { closeMenu(event); onLogout() }} type="button">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <p className="profile-menu-heading">Tu cuenta</p>
                <button className="profile-menu-action" onClick={(event) => { closeMenu(event); onLogin() }} type="button">
                  Iniciar sesión
                </button>
                <button className="profile-menu-action secondary" onClick={(event) => { closeMenu(event); onRegister() }} type="button">
                  Registrarse
                </button>
              </>
            )}
          </div>
        </details>
      </header>
    </>
  )
}

export { BrandHeader }
