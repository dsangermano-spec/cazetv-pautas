'use client'
import { useEffect, useState } from 'react'

const VAZIO = { data: '', reporter: '', titulo: '', conteudo: '' }

export default function Home() {
  const [pautas, setPautas] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [editando, setEditando] = useState(null)
  const [filtroData, setFiltroData] = useState('')
  const [expandido, setExpandido] = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const res = await fetch('/api/pautas')
    const data = await res.json()
    setPautas(data.sort((a, b) => a.data.localeCompare(b.data)))
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

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>📋 Pautas CazéTV</h1>

      {/* Formulário */}
      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>{editando ? '✏️ Editar Pauta' : '➕ Nova Pauta'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#666' }}>Data</label>
            <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })}
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px', marginTop: 4, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#666' }}>Repórter</label>
            <input type="text" placeholder="Nome do repórter" value={form.reporter}
              onChange={e => setForm({ ...form, reporter: e.target.value })}
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px', marginTop: 4, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: '#666' }}>Título da Pauta</label>
          <input type="text" placeholder="Título resumido" value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
            style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px', marginTop: 4, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: '#666' }}>Pauta completa</label>
          <textarea placeholder="Descreva a pauta completa..." value={form.conteudo}
            onChange={e => setForm({ ...form, conteudo: e.target.value })}
            rows={5} style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px', marginTop: 4, boxSizing: 'border-box', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={salvar}
            style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
            {editando ? 'Salvar edição' : 'Adicionar pauta'}
          </button>
          {editando && (
            <button onClick={cancelar}
              style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Filtro */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: '#666' }}>Filtrar por data:</label>
        <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)}
          style={{ border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px' }} />
        {filtroData && (
          <button onClick={() => setFiltroData('')}
            style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontSize: 13 }}>
            Limpar
          </button>
        )}
      </div>

      {/* Lista */}
      {Object.keys(porData).length === 0 && (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '3rem 0' }}>Nenhuma pauta cadastrada.</p>
      )}

      {Object.entries(porData).map(([data, grupo]) => (
        <div key={data} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            📅 {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </h3>
          {grupo.map(p => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 12, padding: '1rem', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{p.titulo}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>👤 {p.reporter}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => editar(p)}
                    style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontSize: 13 }}>Editar</button>
                  <button onClick={() => deletar(p.id)}
                    style={{ background: 'none', border: 'none', color: '#e00', cursor: 'pointer', fontSize: 13 }}>Deletar</button>
                </div>
              </div>
              {p.conteudo && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                    style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                    {expandido === p.id ? 'Ocultar pauta ▲' : 'Ver pauta completa ▼'}
                  </button>
                  {expandido === p.id && (
                    <p style={{ marginTop: 8, fontSize: 13, color: '#444', whiteSpace: 'pre-wrap', background: '#f9f9f9', borderRadius: 8, padding: 12 }}>
                      {p.conteudo}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </main>
  )
}
