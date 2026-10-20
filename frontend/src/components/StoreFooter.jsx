function StoreFooter() {
  return (
    <footer className="site-footer">
      <span className="footer-brand">Reina Madre</span>
      <p>Un lugar para encontrar algo especial.</p>
      <div className="footer-links">
        <a href="/catalogo">Catálogo</a>
        <a href="/nosotros">Nosotros</a>
        <a href="/login">Mi cuenta</a>
      </div>
      <small>© {new Date().getFullYear()} Reina Madre</small>
    </footer>
  )
}

export { StoreFooter }
