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
        <div className="brand" aria-label="Reina Madre">
          <span className="brand-mark" aria-hidden="true">✿</span>
          <span className="brand-wordmark"><strong>REINA MADRE</strong></span>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          <a href="/inicio">Inicio</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/catalogo">Catálogo</a>
          <a href="/inspiracion">Inspiración</a>
          <a href="/ayuda">Ayuda</a>
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
