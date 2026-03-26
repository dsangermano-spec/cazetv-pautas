'use client'
import { useEffect, useState } from 'react'

const VAZIO = { data: '', reporter: '', titulo: '', conteudo: '' }
const AMARELO = '#FFD600'
const ESCURO = '#111111'
const CARD = '#1A1A1A'
const BORDA = '#2A2A2A'
const TEXTO = '#F0F0F0'
const SUBTEXTO = '#888888'

export default function Home() {
  const [pautas, setPautas] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [editando, setEditando] = useState(null)
  const [filtroData, setFiltroData] = useState('')
  const [expandido, setExpandido] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const res = await fetch('/api/pautas')
    const data = await res.json()
    setPautas(data.sort((a, b) => a.data.localeCompare(b.data)))
    setLoading(false)
  }

  async function salvar() {
    if (!form.data || !form.reporter || !form.titulo) return alert('Preencha data, repórter e título.')
    if (editando) {
      await fetch('/api/pautas', { method: 'PUT', body: JSON.stringify({ ...form, id: editando }) })
      setEditando(null)
    } else {
      await fetch('/api/pautas', { method: 'POST', body: JSON.stringify(form) })
    }
    setForm(VAZIO)
    carregar()
  }

  async function deletar(id) {
    if (!confirm('Deletar esta pauta?')) return
    await fetch('/api/pautas', { method: 'DELETE', body: JSON.stringify({ id }) })
    carregar()
  }

  function editar(p) {
    setForm({ data: p.data, reporter: p.reporter, titulo: p.titulo, conteudo: p.conteudo })
    setEditando(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelar() {
    setForm(VAZIO)
    setEditando(null)
  }

  const exibidas = filtroData ? pautas.filter(p => p.data === filtroData) : pautas
  const porData = exibidas.reduce((acc, p) => {
    acc[p.data] = acc[p.data] || []
    acc[p.data].push(p)
    return acc
  }, {})

  const input = {
    width: '100%',
    background: '#222',
    border: `1px solid ${BORDA}`,
    borderRadius: 8,
    padding: '10px 14px',
    marginTop: 6,
    boxSizing: 'border-box',
    color: TEXTO,
    fontSize: 14,
    outline: 'none',
  }

  return (
    <main style={{ minHeight: '100vh', background: ESCURO, color: TEXTO, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#000', borderBottom: `3px solid ${AMARELO}`, padding: '1rem 0', marginBottom: '2rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: AMARELO, color: '#000', fontWeight: 900, fontSize: 18, padding: '4px 10px', borderRadius: 6, letterSpacing: -0.5 }}>CAZÉ</span>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>PAUTAS</span>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        {/* Formulário */}
        <div style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 1.2rem', fontSize: 16, fontWeight: 700, color: AMARELO }}>
            {editando ? '✏️ Editar Pauta' : '+ Nova Pauta'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Data</label>
              <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} style={{ ...input, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Repórter</label>
              <input type="text" placeholder="Nome do repórter" value={form.reporter}
                onChange={e => setForm({ ...form, reporter: e.target.value })} style={input} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Título da Pauta</label>
            <input type="text" placeholder="Título resumido" value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })} style={input} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pauta completa</label>
            <textarea placeholder="Descreva a pauta completa..." value={form.conteudo}
              onChange={e => setForm({ ...form, conteudo: e.target.value })}
              rows={5} style={{ ...input, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={salvar} style={{
              background: AMARELO, color: '#000', border: 'none', borderRadius: 8,
              padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14
            }}>
              {editando ? 'Salvar edição' : 'Adicionar pauta'}
            </button>
            {editando && (
              <button onClick={cancelar} style={{
                background: 'transparent', border: `1px solid ${BORDA}`, borderRadius: 8,
                padding: '10px 20px', cursor: 'pointer', color: SUBTEXTO, fontSize: 14
              }}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Filtro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>Filtrar por data</label>
          <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)}
            style={{ ...input, width: 'auto', marginTop: 0, colorScheme: 'dark' }} />
          {filtroData && (
            <button onClick={() => setFiltroData('')} style={{
              background: 'none', border: 'none', color: AMARELO, cursor: 'pointer', fontSize: 13, fontWeight: 600
            }}>Limpar</button>
          )}
        </div>

        {/* Lista */}
        {loading && <p style={{ color: SUBTEXTO, textAlign: 'center', padding: '3rem 0' }}>Carregando...</p>}

        {!loading && Object.keys(porData).length === 0 && (
          <p style={{ color: SUBTEXTO, textAlign: 'center', padding: '3rem 0' }}>Nenhuma pauta cadastrada.</p>
        )}

        {Object.entries(porData).map(([data, grupo]) => (
          <div key={data} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 4, height: 18, background: AMARELO, borderRadius: 2 }} />
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: SUBTEXTO, textTransform: 'uppercase', letterSpacing: 1 }}>
                {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grupo.map(p => (
                <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 12, padding: '1rem 1.2rem', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = AMARELO}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BORDA}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{p.titulo}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: SUBTEXTO }}>👤 {p.reporter}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginLeft: 12, flexShrink: 0 }}>
                      <button onClick={() => editar(p)} style={{ background: 'none', border: 'none', color: AMARELO, cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>Editar</button>
                      <button onClick={() => deletar(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>Deletar</button>
                    </div>
                  </div>
                  {p.conteudo && (
                    <div style={{ marginTop: 10 }}>
                      <button onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                        style={{ background: 'none', border: 'none', color: SUBTEXTO, cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {expandido === p.id ? '▲ Ocultar pauta' : '▼ Ver pauta completa'}
                      </button>
                      {expandido === p.id && (
                        <p style={{ marginTop: 10, fontSize: 14, color: '#ccc', whiteSpace: 'pre-wrap', background: '#222', borderRadius: 8, padding: '12px 14px', lineHeight: 1.7, borderLeft: `3px solid ${AMARELO}` }}>
                          {p.conteudo}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
