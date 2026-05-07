export function LegalPage({ title, children }) {
  return (
    <div className="page-stack" style={{ maxWidth: 900, margin: '0 auto' }}>
      <section className="card section-card">
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{children}</div>
      </section>
    </div>
  )
}

