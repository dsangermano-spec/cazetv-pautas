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

const inp = {
  width: '100%', background: '#222', border: '1px solid #2A2A2A',
  borderRadius: 8, padding: '10px 14px', marginTop: 6,
  boxSizing: 'border-box', color: '#F0F0F0', fontSize: 14, outline: 'none',
}

function formatarData(data) {
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
}

function formatarDataCurta(data) {
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short'
  })
}

export default function Home() {
  const [aba, setAba] = useState('pautas')
  const [pautas, setPautas] = useState([])
  const [relatorios, setRelatorios] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [uploadando, setUploadando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)

  const [formPauta, setFormPauta] = useState(VAZIO_PAUTA)
  const [editandoPauta, setEditandoPauta] = useState(null)
  const [formRel, setFormRel] = useState(VAZIO_RELATORIO)
  const [editandoRel, setEditandoRel] = useState(null)

  useEffect(() => { carregarPautas(); carregarRelatorios() }, [])

  async function carregarPautas() {
    setLoading(true)
    const res = await fetch('/api/pautas')
    const data = await res.json()
    const sorted = data.sort((a, b) => a.data.localeCompare(b.data))
    setPautas(sorted)
    if (sorted.length > 0 && !dataSelecionada) setDataSelecionada(sorted[0].data)
    setLoading(false)
  }

  async function carregarRelatorios() {
    const res = await fetch('/api/relatorios')
    const data = await res.json()
    setRelatorios(data.sort((a, b) => a.data.localeCompare(b.data)))
  }

  function agruparPorData(lista) {
    return lista.reduce((acc, p) => {
      acc[p.data] = acc[p.data] || []
      acc[p.data].push(p)
      return acc
    }, {})
  }

  const porDataPautas = agruparPorData(pautas)
  const porDataRelatorios = agruparPorData(relatorios)
  const datasP = Object.keys(porDataPautas).sort()
  const datasR = Object.keys(porDataRelatorios).sort()
  const datas = aba === 'pautas' ? datasP : datasR
  const itensDoDia = aba === 'pautas'
    ? (porDataPautas[dataSelecionada] || [])
    : (porDataRelatorios[dataSelecionada] || [])

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
    setDataSelecionada(formPauta.data)
    setFormPauta(VAZIO_PAUTA)
    setMostrarForm(false)
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
    setMostrarForm(true)
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
    setDataSelecionada(formRel.data)
    setFormRel(VAZIO_RELATORIO)
    setMostrarForm(false)
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
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelar() {
    setFormPauta(VAZIO_PAUTA)
    setFormRel(VAZIO_RELATORIO)
    setEditandoPauta(null)
    setEditandoRel(null)
    setMostrarForm(false)
  }

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <main style={{ minHeight: '100vh', background: ESCURO, color: TEXTO, fontFamily: "'Inter','Helvetica Neue',sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ background: '#000', borderBottom: `3px solid ${AMARELO}`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ background: AMARELO, color: '#000', fontWeight: 900, fontSize: 18, padding: '4px 10px', borderRadius: 6 }}>CAZÉ</span>
        <span style={{ fontWeight: 700, fontSize: 18 }}>PAUTAS & RELATÓRIOS</span>
      </header>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: CARD, borderBottom: `1px solid ${BORDA}`, flexShrink: 0 }}>
        {['pautas', 'relatorios'].map(a => (
          <button key={a} onClick={() => { setAba(a); setDataSelecionada(null); setMostrarForm(false) }} style={{
            padding: '8px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
            background: aba === a ? AMARELO : 'transparent', color: aba === a ? '#000' : SUBTEXTO,
          }}>
            {a === 'pautas' ? '📋 Pautas' : '📝 Relatórios'}
          </button>
        ))}
      </div>

      {/* Layout principal */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar */}
        <aside style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${BORDA}`, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 10, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '0 6px', marginBottom: 4 }}>Datas</p>
          {loading && <p style={{ fontSize: 12, color: SUBTEXTO, padding: '0 6px' }}>Carregando...</p>}
          {!loading && datas.length === 0 && <p style={{ fontSize: 12, color: SUBTEXTO, padding: '0 6px' }}>Nenhum registro.</p>}
          {datas.map(d => (
            <button key={d} onClick={() => { setDataSelecionada(d); setMostrarForm(false) }} style={{
              width: '100%', textAlign: 'left', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
              background: dataSelecionada === d ? AMARELO : CARD,
              color: dataSelecionada === d ? '#000' : TEXTO,
              outline: dataSelecionada === d ? 'none' : `1px solid ${BORDA}`,
            }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>{formatarDataCurta(d)}</span>
              <span style={{ display: 'block', fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                {aba === 'pautas' ? porDataPautas[d]?.length : porDataRelatorios[d]?.length} {aba === 'pautas' ? 'pauta(s)' : 'relatório(s)'}
              </span>
            </button>
          ))}
          <button onClick={() => { setMostrarForm(true); setDataSelecionada(null); cancelar() }} style={{
            marginTop: 8, width: '100%', padding: '8px 0', background: 'transparent',
            border: `1px dashed ${BORDA}`, borderRadius: 8, color: SUBTEXTO, fontSize: 12, cursor: 'pointer'
          }}>
            + nova data
          </button>
        </aside>

        {/* Conteúdo */}
        <section style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

          {/* Formulário */}
          {mostrarForm && (
            <div style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: 15, fontWeight: 700, color: AMARELO }}>
                {(editandoPauta || editandoRel) ? '✏️ Editar' : `+ ${aba === 'pautas' ? 'Nova Pauta' : 'Novo Relatório'}`}
              </h2>

              {aba === 'pautas' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase' }}>Data</label>
                      <input type="date" value={formPauta.data} onChange={e => setFormPauta({ ...formPauta, data: e.target.value })} style={{ ...inp, colorScheme: 'dark' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase' }}>Repórter</label>
                      <input type="text" placeholder="Nome" value={formPauta.reporter} onChange={e => setFormPauta({ ...formPauta, reporter: e.target.value })} style={inp} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase' }}>Título</label>
                    <input type="text" placeholder="Título resumido" value={formPauta.titulo} onChange={e => setFormPauta({ ...formPauta, titulo: e.target.value })} style={inp} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase' }}>Pauta completa</label>
                    <textarea placeholder="Descreva a pauta..." value={formPauta.conteudo} onChange={e => setFormPauta({ ...formPauta, conteudo: e.target.value })} rows={5} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase' }}>Anexar PDF</label>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <label style={{ background: '#222', border: `1px solid ${BORDA}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: SUBTEXTO, fontWeight: 600 }}>
                        {uploadando ? 'Enviando...' : formPauta.pdfUrl ? '✅ PDF anexado' : '📎 Escolher PDF'}
                        <input type="file" accept="application/pdf" onChange={handlePdf} style={{ display: 'none' }} />
                      </label>
                      {formPauta.pdfUrl && <button onClick={() => setFormPauta(f => ({ ...f, pdfUrl: '' }))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Remover</button>}
                    </div>
                  </div>
                </>
              )}

              {aba === 'relatorios' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase' }}>Data</label>
                      <input type="date" value={formRel.data} onChange={e => setFormRel({ ...formRel, data: e.target.value })} style={{ ...inp, colorScheme: 'dark' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase' }}>Repórter</label>
                      <input type="text" placeholder="Nome" value={formRel.reporter} onChange={e => setFormRel({ ...formRel, reporter: e.target.value })} style={inp} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, color: SUBTEXTO, fontWeight: 700, textTransform: 'uppercase' }}>Relatório</label>
                    <textarea placeholder="O que aconteceu hoje..." value={formRel.texto} onChange={e => setFormRel({ ...formRel, texto: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={aba === 'pautas' ? salvarPauta : salvarRelatorio} disabled={uploadando} style={{
                  background: AMARELO, color: '#000', border: 'none', borderRadius: 8,
                  padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14
                }}>
                  {(editandoPauta || editandoRel) ? 'Salvar edição' : 'Adicionar'}
                </button>
                <button onClick={cancelar} style={{ background: 'transparent', border: `1px solid ${BORDA}`, borderRadius: 8, padding: '10px 20px', cursor: 'pointer', color: SUBTEXTO, fontSize: 14 }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Cabeçalho do dia */}
          {dataSelecionada && !mostrarForm && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 20, background: AMARELO, borderRadius: 2 }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: SUBTEXTO, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {formatarData(dataSelecionada)}
                </h3>
              </div>
              <button onClick={() => { setMostrarForm(true); if (aba === 'pautas') setFormPauta({ ...VAZIO_PAUTA, data: dataSelecionada }); else setFormRel({ ...VAZIO_RELATORIO, data: dataSelecionada }) }} style={{
                background: AMARELO, color: '#000', border: 'none', borderRadius: 8,
                padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13
              }}>
                + {aba === 'pautas' ? 'Nova pauta' : 'Novo relatório'}
              </button>
            </div>
          )}

          {/* Cards do dia */}
          {dataSelecionada && !mostrarForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {itensDoDia.length === 0 && <p style={{ color: SUBTEXTO, fontSize: 14 }}>Nenhum registro para este dia.</p>}
              {aba === 'pautas' && itensDoDia.map(p => (
                <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 12, padding: '1rem 1.2rem' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = AMARELO}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BORDA}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{p.titulo}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: SUBTEXTO }}>👤 {p.reporter}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => editarPauta(p)} style={{ background: 'none', border: 'none', color: AMARELO, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Editar</button>
                      <button onClick={() => deletarPauta(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Deletar</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {p.conteudo && (
                      <button onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                        style={{ background: 'none', border: 'none', color: SUBTEXTO, cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {expandido === p.id ? '▲ Ocultar' : '▼ Ver pauta completa'}
                      </button>
                    )}
                    {p.pdfUrl && (
                      <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: AMARELO, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
              {aba === 'relatorios' && itensDoDia.map(r => (
                <div key={r.id} style={{ background: CARD, border: `1px solid ${BORDA}`, borderRadius: 12, padding: '1rem 1.2rem' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = AMARELO}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BORDA}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
          )}

          {!dataSelecionada && !mostrarForm && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
              <p style={{ color: SUBTEXTO, fontSize: 14 }}>Selecione uma data na lateral ou crie um novo registro.</p>
              <button onClick={() => setMostrarForm(true)} style={{ background: AMARELO, color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                + {aba === 'pautas' ? 'Nova pauta' : 'Novo relatório'}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
