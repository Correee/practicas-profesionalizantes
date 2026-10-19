function StoreFooter() {
  return (
    <footer className="site-footer">
      <span className="footer-brand">Reina Madre</span>
      <p>Un lugar para encontrar algo especial.</p>
      <div className="footer-links">
        <span>Catálogo</span>
        <span>Preguntas frecuentes</span>
        <span>Ayuda</span>
      </div>
      <small>© {new Date().getFullYear()} Reina Madre</small>
    </footer>
  )
}

export { StoreFooter }
