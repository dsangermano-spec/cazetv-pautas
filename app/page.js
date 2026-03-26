'use client'
import { useEffect, useState } from 'react'

const VAZIO_PAUTA = { data: '', reporter: '', titulo: '', conteudo: '', pdfUrl: '' }
const VAZIO_RELATORIO = { data: '', reporter: '', texto: '' }
const AMARELO = '#FFD600'
const ESCURO = '#111111'
const CARD = '#1A1A1A'
const BORDA = '#2A2A2A'
const TEXTO = '#F0F0F0'
const SUBTEXTO = '#888888'

const input = {
  width: '100%',
  background: '#222',
  border: `1px solid #2A2A2A`,
  borderRadius: 8,
  padding: '10px 14px',
  marginTop: 6,
  boxSizing: 'border-box',
  color: '#F0F0F0',
  fontSize: 14,
  outline: 'none',
}

export default function Home() {
  const [aba, setAba] = useState('pautas')

  const [pautas, setPautas] = useState([])
  const [formPauta, setFormPauta] = useState(VAZIO_PAUTA)
  const [editandoPauta, setEditandoPauta] = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [uploadando, setUploadando] = useState(false)

  const [relatorios, setRelatorios] = useState([])
  const [formRel, setFormRel] = useState(VAZIO_RELATORIO)
  const [editandoRel, setEditandoRel] = useState(null)

  const [filtroData, setFiltroData] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPautas()
    carregarRelatorios()
  }, [])

  async function carregarPautas() {
    setLoading(true)
    const res = await fetch('/api/pautas')
    const data = await res.json()
    setPautas(data.sort((a, b) => a.data.localeCompare(b.data)))
    setLoading(false)
  }

  async function carregarRelatorios() {
    const res = await fetch('/api/relatorios')
    const data = await res.json()
    setRelatorios(data.sort((a, b) => a.data.localeCompare(b.data)))
  }

  async function handlePdf(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadando(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setFormPauta(f => ({ ...f, pdfUrl: data.url }))
    setUploadando(false)
  }

  async function salvarPauta() {
    if (!formPauta.data || !formPauta.reporter || !formPauta.titulo) return alert('Preencha data, repórter e título.')
    if (editandoPauta) {
      await fetch('/api/pautas', { method: 'PUT', body: JSON.stringify({ ...formPauta, id: editandoPauta }) })
      setEditandoPauta(null)
    } else {
      await fetch('/api/pautas', { method: 'POST', body: JSON.stringify(formPauta) })
    }
    setFormPauta(VAZIO_PAUTA)
    carregarPautas()
  }

  async function deletarPauta(id) {
    if (!confirm('Deletar esta pauta?')) return
    await fetch('/api/pautas', { method: 'DELETE', body: JSON.stringify({ id }) })
    carregarPautas()
  }

  function editarPauta(p) {
    setFormPauta({ data: p.data, reporter: p.reporter, titulo: p.titulo, conteudo: p.conteudo, pdfUrl: p.pdfUrl || '' })
    setEditandoPauta(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function salvarRelatorio() {
    if (!formRel.data || !formRel.reporter || !formRel.texto) return alert('Preencha data, repórter e relatório.')
    if (editandoRel) {
      await fetch('/api/relatorios', { method: 'PUT', body: JSON.stringify({ ...formRel, id: editandoRel }) })
      setEditandoRel(null)
    } else {
      await fetch('/api/relatorios', { method: 'POST', body: JSON.stringify(formRel) })
    }
    setFormRel(VAZIO_RELATORIO)
    carregarRelatorios()
  }

  async function deletarRelatorio(id) {
    if (!confirm('Deletar este relatório?')) return
    await fetch('/api/relatorios', { method: 'DELETE', body: JSON.stringify({ id }) })
    carregarRelatorios()
  }

  function editarRelatorio(r) {
    setFormRel({ data: r.data, reporter: r.reporter, texto: r.texto })
    setEditandoRel(r.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function agruparPorData(lista) {
    const filtrada = filtroData ? lista.filter(p => p.data === filtroData) : lista
    return filtrada.reduce((acc, p) => {
      acc[p.data] = acc[p.data] || []
      acc[p.data].push(p)
      return acc
    }, {})
  }

  const porDataPautas = agruparPorData(pautas)
  const porDataRelatorios = agruparPorData(relatorios)

  function formatarData(data) {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })
  }

  return (
    <main style={{ minHeight: '100vh', background: ESCURO, color: TEXTO, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      <header style={{ background: '#000', borderBottom: `3px solid ${AMARELO}`, padding: '1rem 0', marginBottom: '2rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: AMARELO, color: '#000', fontWeight: 900, fontSize: 18, padding: '4px 10px', borderRadius: 6 }}>CAZÉ</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>PAUTAS & RELATÓRIOS</span>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        {/* Abas */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: CARD, borderRadius: 10, padding: 4, border: `1px solid ${BORDA}` }}>
          {['pautas', 'relatorios'].map(a => (
            <button key={a} onClick={() => setAba(a)} style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
              background: aba === a ? AMARELO : 'transparent',
              color: aba === a ? '#000' : SUBTEXTO,
            }}>
              {a === 'pautas' ? '📋 Pautas' : '📝 Relatórios'}
            </button>
          ))}
        </div>

        {/* Filtro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>Filtrar por data</label>
          <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)}
            style={{ ...input, width: 'auto', marginTop: 0, colorScheme: 'dark' }} />
          {filtroData && (
            <button onClick={() => setFiltroData('')} style={{ background: 'none', border: 'none', color: AMARELO, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Limpar</button>
          )}
        </div>

        {/* ---- ABA PAUTAS ---- */}
        {aba === 'pautas' && (
          <>
            <div style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 1.2rem', fontSize: 16, fontWeight: 700, color: AMARELO }}>
                {editandoPauta ? '✏️ Editar Pauta' : '+ Nova Pauta'}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase' }}>Data</label>
                  <input type="date" value={formPauta.data} onChange={e => setFormPauta({ ...formPauta, data: e.target.value })} style={{ ...input, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase' }}>Repórter</label>
                  <input type="text" placeholder="Nome do repórter" value={formPauta.reporter}
                    onChange={e => setFormPauta({ ...formPauta, reporter: e.target.value })} style={input} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase' }}>Título</label>
                <input type="text" placeholder="Título resumido" value={formPauta.titulo}
                  onChange={e => setFormPauta({ ...formPauta, titulo: e.target.value })} style={input} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase' }}>Pauta completa</label>
                <textarea placeholder="Descreva a pauta completa..." value={formPauta.conteudo}
                  onChange={e => setFormPauta({ ...formPauta, conteudo: e.target.value })}
                  rows={5} style={{ ...input, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase' }}>Anexar PDF</label>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{
                    background: '#222', border: `1px solid ${BORDA}`, borderRadius: 8, padding: '10px 16px',
                    cursor: 'pointer', fontSize: 13, color: SUBTEXTO, fontWeight: 600
                  }}>
                    {uploadando ? 'Enviando...' : formPauta.pdfUrl ? '✅ PDF anexado' : '📎 Escolher PDF'}
                    <input type="file" accept="application/pdf" onChange={handlePdf} style={{ display: 'none' }} />
                  </label>
                  {formPauta.pdfUrl && !uploadando && (
                    <button onClick={() => setFormPauta(f => ({ ...f, pdfUrl: '' }))}
                      style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={salvarPauta} disabled={uploadando} style={{
                  background: AMARELO, color: '#000', border: 'none', borderRadius: 8,
                  padding: '10px 20px', cursor: uploadando ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, opacity: uploadando ? 0.6 : 1
                }}>
                  {editandoPauta ? 'Salvar edição' : 'Adicionar pauta'}
                </button>
                {editandoPauta && (
                  <button onClick={() => { setFormPauta(VAZIO_PAUTA); setEditandoPauta(null) }}
                    style={{ background: 'transparent', border: `1px solid ${BORDA}`, borderRadius: 8, padding: '10px 20px', cursor: 'pointer', color: SUBTEXTO, fontSize: 14 }}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {loading && <p style={{ color: SUBTEXTO, textAlign: 'center', padding: '3rem 0' }}>Carregando...</p>}
            {!loading && Object.keys(porDataPautas).length === 0 && (
              <p style={{ color: SUBTEXTO, textAlign: 'center', padding: '3rem 0' }}>Nenhuma pauta cadastrada.</p>
            )}
            {Object.entries(porDataPautas).map(([data, grupo]) => (
              <div key={data} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 4, height: 18, background: AMARELO, borderRadius: 2 }} />
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: SUBTEXTO, textTransform: 'uppercase', letterSpacing: 1 }}>{formatarData(data)}</h3>
                </div>
                {grupo.map(p => (
                  <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 12, padding: '1rem 1.2rem', marginBottom: 10 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = AMARELO}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDA}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{p.titulo}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: SUBTEXTO }}>👤 {p.reporter}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => editarPauta(p)} style={{ background: 'none', border: 'none', color: AMARELO, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Editar</button>
                        <button onClick={() => deletarPauta(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Deletar</button>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {p.conteudo && (
                        <button onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                          style={{ background: 'none', border: 'none', color: SUBTEXTO, cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {expandido === p.id ? '▲ Ocultar' : '▼ Ver pauta completa'}
                        </button>
                      )}
                      {p.pdfUrl && (
                        <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 12, fontWeight: 600, color: AMARELO, textDecoration: 'none',
                          textTransform: 'uppercase', letterSpacing: 0.5
                        }}>
                          📄 Ver PDF
                        </a>
                      )}
                    </div>
                    {expandido === p.id && p.conteudo && (
                      <p style={{ marginTop: 10, fontSize: 14, color: '#ccc', whiteSpace: 'pre-wrap', background: '#222', borderRadius: 8, padding: '12px 14px', lineHeight: 1.7, borderLeft: `3px solid ${AMARELO}` }}>
                        {p.conteudo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* ---- ABA RELATÓRIOS ---- */}
        {aba === 'relatorios' && (
          <>
            <div style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 1.2rem', fontSize: 16, fontWeight: 700, color: AMARELO }}>
                {editandoRel ? '✏️ Editar Relatório' : '+ Novo Relatório'}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase' }}>Data</label>
                  <input type="date" value={formRel.data} onChange={e => setFormRel({ ...formRel, data: e.target.value })} style={{ ...input, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase' }}>Repórter</label>
                  <input type="text" placeholder="Nome do repórter" value={formRel.reporter}
                    onChange={e => setFormRel({ ...formRel, reporter: e.target.value })} style={input} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: SUBTEXTO, fontWeight: 600, textTransform: 'uppercase' }}>Relatório</label>
                <textarea placeholder="O que aconteceu hoje..." value={formRel.texto}
                  onChange={e => setFormRel({ ...formRel, texto: e.target.value })}
                  rows={3} style={{ ...input, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={salvarRelatorio} style={{ background: AMARELO, color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  {editandoRel ? 'Salvar edição' : 'Adicionar relatório'}
                </button>
                {editandoRel && (
                  <button onClick={() => { setFormRel(VAZIO_RELATORIO); setEditandoRel(null) }}
                    style={{ background: 'transparent', border: `1px solid ${BORDA}`, borderRadius: 8, padding: '10px 20px', cursor: 'pointer', color: SUBTEXTO, fontSize: 14 }}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {Object.keys(porDataRelatorios).length === 0 && (
              <p style={{ color: SUBTEXTO, textAlign: 'center', padding: '3rem 0' }}>Nenhum relatório cadastrado.</p>
            )}
            {Object.entries(porDataRelatorios).map(([data, grupo]) => (
              <div key={data} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 4, height: 18, background: AMARELO, borderRadius: 2 }} />
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: SUBTEXTO, textTransform: 'uppercase', letterSpacing: 1 }}>{formatarData(data)}</h3>
                </div>
                {grupo.map(r => (
                  <div key={r.id} style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 12, padding: '1rem 1.2rem', marginBottom: 10 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = AMARELO}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDA}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ margin: 0, fontSize: 13, color: SUBTEXTO }}>👤 {r.reporter}</p>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => editarRelatorio(r)} style={{ background: 'none', border: 'none', color: AMARELO, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Editar</button>
                        <button onClick={() => deletarRelatorio(r.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Deletar</button>
                      </div>
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 14, color: '#ccc', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{r.texto}</p>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  )
}
