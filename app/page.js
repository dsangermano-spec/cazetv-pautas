'use client'
import { useEffect, useState } from 'react'

const VAZIO_PAUTA = { data: '', reporter: '', titulo: '', conteudo: '', pdfUrl: '' }
const VAZIO_RELATORIO = { data: '', reporter: '', texto: '' }
const VAZIO_PREVISAO = { data: '', titulo: '', descricao: '' }
const VAZIO_CONTATO = { nome: '', telefone: '', cargo: '' }
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

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

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
function limparTelefone(tel) { return tel.replace(/\D/g, '') }

function Highlight({ text, busca }) {
  if (!busca || !text) return <span>{text}</span>
  const parts = text.split(new RegExp(`(${busca})`, 'gi'))
  return <span>{parts.map((p, i) => p.toLowerCase() === busca.toLowerCase() ? <mark key={i} style={{ background: AMARELO, color: '#000', borderRadius: 3, padding: '0 2px', fontWeight: 700 }}>{p}</mark> : p)}</span>
}

function Calendario({ pautas, relatorios, previsoes, onDiaClick }) {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  const hojeStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`

  function getDia(d) {
    const str = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    return {
      str,
      pautas: pautas.filter(p => p.data === str),
      relatorios: relatorios.filter(r => r.data === str),
      previsoes: previsoes.filter(p => p.data === str),
    }
  }

  function navMes(dir) {
    let nm = mes + dir, na = ano
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm); setAno(na)
  }

  const cells = []
  for (let i = 0; i < primeiroDia; i++) cells.push(null)
  for (let d = 1; d <= totalDias; d++) cells.push(d)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={() => navMes(-1)} style={{ background: CARD, border: `1px solid ${BORDA}`, color: TEXTO, borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>←</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: TEXTO }}>{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)} style={{ background: CARD, border: `1px solid ${BORDA}`, color: TEXTO, borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>→</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: SUBTEXTO, padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const info = getDia(d)
          const isHoje = info.str === hojeStr
          const total = info.pautas.length + info.relatorios.length + info.previsoes.length
          const MAX = 2
          return (
            <div key={i} onClick={() => total > 0 && onDiaClick(info)} style={{
              background: CARD, border: `1px solid ${isHoje ? AMARELO : BORDA}`,
              borderRadius: 8, padding: '6px', minHeight: 72, cursor: total > 0 ? 'pointer' : 'default',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => { if (total > 0) e.currentTarget.style.borderColor = AMARELO }}
              onMouseLeave={e => { if (!isHoje) e.currentTarget.style.borderColor = BORDA }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: isHoje ? AMARELO : SUBTEXTO, marginBottom: 4 }}>{d}</div>
              {info.pautas.slice(0, MAX).map((p, j) => (
                <div key={j} style={{ background: AMARELO, color: '#000', borderRadius: 4, padding: '2px 5px', fontSize: 10, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titulo}</div>
              ))}
              {info.relatorios.slice(0, info.pautas.length < MAX ? MAX - info.pautas.length : 0).map((r, j) => (
                <div key={j} style={{ background: '#2A2A2A', color: '#888', border: '0.5px solid #444', borderRadius: 4, padding: '2px 5px', fontSize: 10, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📝 {r.reporter}</div>
              ))}
              {info.previsoes.slice(0, Math.max(0, MAX - info.pautas.length - info.relatorios.length)).map((p, j) => (
                <div key={j} style={{ background: '#1a1a2e', color: '#8888ff', border: '0.5px solid #333366', borderRadius: 4, padding: '2px 5px', fontSize: 10, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🔭 {p.titulo}</div>
              ))}
              {total > MAX && <div style={{ fontSize: 10, color: SUBTEXTO, marginTop: 2 }}>+{total - MAX} mais</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const [aba, setAba] = useState('pautas')
  const [pautas, setPautas] = useState([])
  const [relatorios, setRelatorios] = useState([])
  const [previsoes, setPrevisoes] = useState([])
  const [contatos, setContatos] = useState([])
  const [busca, setBusca] = useState('')
  const [buscaGeral, setBuscaGeral] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [diaModal, setDiaModal] = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [uploadando, setUploadando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoContato, setEditandoContato] = useState(null)
  const [formContato, setFormContato] = useState(VAZIO_CONTATO)
  const [formPauta, setFormPauta] = useState(VAZIO_PAUTA)
  const [editandoPauta, setEditandoPauta] = useState(null)
  const [formRel, setFormRel] = useState(VAZIO_RELATORIO)
  const [editandoRel, setEditandoRel] = useState(null)
  const [formPrev, setFormPrev] = useState(VAZIO_PREVISAO)
  const [editandoPrev, setEditandoPrev] = useState(null)

  useEffect(() => { carregarTudo() }, [])

  async function carregarTudo() {
    setLoading(true)
    const [rP, rR, rPrev, rC] = await Promise.all([
      fetch('/api/pautas').then(r => r.json()),
      fetch('/api/relatorios').then(r => r.json()),
      fetch('/api/previsoes').then(r => r.json()),
      fetch('/api/contatos').then(r => r.json()),
    ])
    setPautas(rP.sort((a, b) => a.data.localeCompare(b.data)))
    setRelatorios(rR.sort((a, b) => a.data.localeCompare(b.data)))
    setPrevisoes(rPrev.sort((a, b) => a.data.localeCompare(b.data)))
    setContatos(rC.sort((a, b) => a.nome.localeCompare(b.nome)))
    setLoading(false)
  }

  async function carregarPautas() { const r = await fetch('/api/pautas'); setPautas((await r.json()).sort((a,b) => a.data.localeCompare(b.data))) }
  async function carregarRelatorios() { const r = await fetch('/api/relatorios'); setRelatorios((await r.json()).sort((a,b) => a.data.localeCompare(b.data))) }
  async function carregarPrevisoes() { const r = await fetch('/api/previsoes'); setPrevisoes((await r.json()).sort((a,b) => a.data.localeCompare(b.data))) }
  async function carregarContatos() { const r = await fetch('/api/contatos'); setContatos((await r.json()).sort((a,b) => a.nome.localeCompare(b.nome))) }

  function agruparPorData(lista) {
    return lista.reduce((acc, p) => { acc[p.data] = acc[p.data] || []; acc[p.data].push(p); return acc }, {})
  }

  function enviarWhatsApp(pauta) {
    const contato = contatos.find(c => c.nome.toLowerCase().includes(pauta.reporter.toLowerCase()) || pauta.reporter.toLowerCase().includes(c.nome.toLo
