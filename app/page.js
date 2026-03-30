'use client'
import { useEffect, useState } from 'react'

const VAZIO_PAUTA = { data: '', dataFim: '', reporter: '', titulo: '', conteudo: '', pdfUrl: '' }
const VAZIO_RELATORIO = { data: '', reporter: '', texto: '' }
const VAZIO_PREVISAO = { data: '', dataFim: '', titulo: '', descricao: '' }
const VAZIO_CONTATO = { nome: '', telefone: '', cargo: '' }
const VAZIO_PEDIDO = { data: '', quem: '', reporter: '', local: '', descricao: '' }
const VAZIO_METRICA = { data: '', titulo: '', reporter: '', plataforma: '', noAr: 'sim', views: '' }

const AMARELO = '#FFD600'
const LARANJA = '#FF6B00'
const ESCURO = '#111111'
const CARD = '#1A1A1A'
const BORDA = '#2A2A2A'
const TEXTO = '#F0F0F0'
const SUBTEXTO = '#888888'
const VERDE = '#4CAF50'

const PLATAFORMAS = ['Instagram', 'YouTube', 'Programas', 'Transmissoes']

const inp = {
  width: '100%', background: '#222', border: '1px solid #2A2A2A',
  borderRadius: 8, padding: '10px 14px', marginTop: 6,
  boxSizing: 'border-box', color: '#F0F0F0', fontSize: 14, outline: 'none',
}

const MESES = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab']

function formatarData(data) {
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}
function formatarDataCurta(data) {
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}
function formatarDataSimples(data) {
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
function limparTelefone(tel) { return tel.replace(/\D/g, '') }

function getDatasNoPeriodo(dataInicio, dataFim) {
  const datas = []
  const d = new Date(dataInicio + 'T12:00:00')
  const fim = new Date((dataFim || dataInicio) + 'T12:00:00')
  while (d <= fim) { datas.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1) }
  return datas
}

function diffDias(dataInicio, dataFim) {
  if (!dataFim || dataFim === dataInicio) return 1
  return Math.round((new Date(dataFim + 'T12:00:00') - new Date(dataInicio + 'T12:00:00')) / (1000*60*60*24)) + 1
}

function formatViews(v) {
  if (!v) return '-'
  const n = parseInt(v)
  if (isNaN(n)) return v
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n/1000).toFixed(0) + 'K'
  return n.toString()
}

function Highlight({ text, busca }) {
  if (!busca || !text) return <span>{text}</span>
  const parts = text.split(new RegExp(`(${busca})`, 'gi'))
  return <span>{parts.map((p, i) => p.toLowerCase() === busca.toLowerCase() ? <mark key={i} style={{ background: AMARELO, color: '#000', borderRadius: 3, padding: '0 2px', fontWeight: 700 }}>{p}</mark> : p)}</span>
}

function Calendario({ pautas, relatorios, previsoes, pedidos, onDiaClick }) {
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
      pautas: pautas.filter(p => getDatasNoPeriodo(p.data, p.dataFim).includes(str)),
      relatorios: relatorios.filter(r => r.data === str),
      previsoes: previsoes.filter(p => getDatasNoPeriodo(p.data, p.dataFim).includes(str)),
      pedidos: pedidos.filter(p => p.data === str),
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <button onClick={() => navMes(-1)} style={{ background:CARD, border:`1px solid ${BORDA}`, color:TEXTO, borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:13 }}>{'<'}</button>
        <span style={{ fontSize:16, fontWeight:700, color:TEXTO }}>{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)} style={{ background:CARD, border:`1px solid ${BORDA}`, color:TEXTO, borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:13 }}>{'>'}</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:6 }}>
        {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:SUBTEXTO, padding:'4px 0', textTransform:'uppercase' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const info = getDia(d)
          const isHoje = info.str === hojeStr
          const total = info.pautas.length + info.relatorios.length + info.previsoes.length + info.pedidos.length
          const MAX = 2
          return (
            <div key={i} onClick={() => total > 0 && onDiaClick(info)} style={{ background:CARD, border:`1px solid ${isHoje?AMARELO:BORDA}`, borderRadius:8, padding:'6px', minHeight:72, cursor:total>0?'pointer':'default' }}
              onMouseEnter={e => { if(total>0) e.currentTarget.style.borderColor=AMARELO }}
              onMouseLeave={e => { if(!isHoje) e.currentTarget.style.borderColor=BORDA }}>
              <div style={{ fontSize:12, fontWeight:700, color:isHoje?AMARELO:SUBTEXTO, marginBottom:4 }}>{d}</div>
              {info.pautas.slice(0,MAX).map((p,j) => <div key={j} style={{ background:AMARELO, color:'#000', borderRadius:4, padding:'2px 5px', fontSize:10, fontWeight:700, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.titulo}</div>)}
              {info.pedidos.slice(0,Math.max(0,MAX-info.pautas.length)).map((p,j) => <div key={j} style={{ background:LARANJA, color:'#fff', borderRadius:4, padding:'2px 5px', fontSize:10, fontWeight:700, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.descricao ? p.descricao.slice(0,15) : 'Pedido'}</div>)}
              {info.relatorios.slice(0,Math.max(0,MAX-info.pautas.length-info.pedidos.length)).map((r,j) => <div key={j} style={{ background:'#2A2A2A', color:'#888', border:'0.5px solid #444', borderRadius:4, padding:'2px 5px', fontSize:10, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.reporter}</div>)}
              {info.previsoes.slice(0,Math.max(0,MAX-info.pautas.length-info.pedidos.length-info.relatorios.length)).map((p,j) => <div key={j} style={{ background:'#1a1a2e', color:'#8888ff', border:'0.5px solid #333366', borderRadius:4, padding:'2px 5px', fontSize:10, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.titulo}</div>)}
              {total>MAX && <div style={{ fontSize:10, color:SUBTEXTO, marginTop:2 }}>+{total-MAX} mais</div>}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop:16, display:'flex', gap:16, flexWrap:'wrap' }}>
        {[{c:AMARELO,l:'Pautas'},{c:LARANJA,l:'Pedidos'},{c:'#2A2A2A',l:'Relatorios',b:'0.5px solid #444'},{c:'#1a1a2e',l:'Previsoes',b:'0.5px solid #333366'}].map(({c,l,b}) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10, height:10, background:c, border:b, borderRadius:2 }} /><span style={{ fontSize:11, color:SUBTEXTO }}>{l}</span></div>
        ))}
      </div>
    </div>
  )
}

function AbaMetricas({ metricas, onSalvar, onDeletar, onEditar, pautas }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [modoImportar, setModoImportar] = useState(false)
  const [form, setForm] = useState(VAZIO_METRICA)
  const [editando, setEditando] = useState(null)
  const [filtroPlat, setFiltroPlat] = useState('Todas')
  const [buscaPauta, setBuscaPauta] = useState('')

  const pautasFiltradas = (pautas || []).filter(p =>
    p.titulo.toLowerCase().includes(buscaPauta.toLowerCase()) ||
    (p.reporter||'').toLowerCase().includes(buscaPauta.toLowerCase())
  )

  function importarPauta(p) {
    setForm({ data: p.data, titulo: p.titulo, reporter: p.reporter, plataforma: '', noAr: 'sim', views: '' })
    setModoImportar(false)
    setMostrarForm(true)
  }

  const total = metricas.length
  const noAr = metricas.filter(m => m.noAr === 'sim').length
  const aproveitamento = total > 0 ? Math.round((noAr/total)*100) : 0
  const totalViews = metricas.reduce((acc, m) => acc + (parseInt(m.views)||0), 0)
  const filtradas = filtroPlat === 'Todas' ? metricas : metricas.filter(m => m.plataforma === filtroPlat)

  function iniciarEdicao(m) {
    setForm({ data:m.data, titulo:m.titulo, reporter:m.reporter, plataforma:m.plataforma, noAr:m.noAr, views:m.views||'' })
    setEditando(m.id)
    setMostrarForm(true)
  }

  async function salvar() {
    if (!form.data || !form.titulo) return alert('Preencha data e titulo.')
    if (editando) { await onEditar({ ...form, id: editando }); setEditando(null) }
    else await onSalvar(form)
    setForm(VAZIO_METRICA)
    setMostrarForm(false)
  }

  function cancelar() { setForm(VAZIO_METRICA); setEditando(null); setMostrarForm(false) }

  const corAprov = aproveitamento >= 75 ? VERDE : aproveitamento >= 50 ? AMARELO : '#ff4444'

  return (
    <div style={{ padding:'1.5rem', overflowY:'auto', flex:1 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total de pautas', value: total, cor: TEXTO },
          { label:'Entraram no ar', value: noAr, cor: VERDE },
          { label:'Aproveitamento', value: `${aproveitamento}%`, cor: corAprov },
          { label:'Total de views', value: formatViews(totalViews), cor: AMARELO },
        ].map(({ label, value, cor }) => (
          <div key={label} style={{ background:CARD, borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:cor }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ background:CARD, borderRadius:10, padding:'16px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:SUBTEXTO, textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 }}>Pautas no ar por plataforma</div>
          {PLATAFORMAS.map((p, i) => {
            const count = metricas.filter(m => m.plataforma === p && m.noAr === 'sim').length
            const pct = noAr > 0 ? Math.round((count/noAr)*100) : 0
            const cores = [AMARELO, '#E1306C', '#9146FF', '#00b4d8']
            return (
              <div key={p} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:TEXTO, marginBottom:4 }}>
                  <span>{p}</span>
                  <span style={{ color:SUBTEXTO }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background:'#2A2A2A', borderRadius:4, height:8 }}>
                  <div style={{ background:cores[i], borderRadius:4, height:8, width:`${pct}%`, transition:'width 0.3s' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background:CARD, borderRadius:10, padding:'16px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:SUBTEXTO, textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 }}>Aproveitamento geral</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:120 }}>
            <div style={{ position:'relative', width:120, height:120 }}>
              <svg viewBox="0 0 120 120" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#2A2A2A" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={corAprov} strokeWidth="12"
                  strokeDasharray={`${aproveitamento * 3.14} 314`} strokeLinecap="round" />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:24, fontWeight:700, color:corAprov }}>{aproveitamento}%</span>
                <span style={{ fontSize:11, color:SUBTEXTO }}>no ar</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-around', marginTop:8 }}>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:18, fontWeight:700, color:VERDE }}>{noAr}</div><div style={{ fontSize:11, color:SUBTEXTO }}>Entraram</div></div>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:18, fontWeight:700, color:'#ff4444' }}>{total-noAr}</div><div style={{ fontSize:11, color:SUBTEXTO }}>Nao entraram</div></div>
          </div>
        </div>
      </div>

      <div style={{ background:CARD, borderRadius:10, padding:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['Todas', ...PLATAFORMAS].map(p => (
              <button key={p} onClick={() => setFiltroPlat(p)} style={{
                padding:'5px 12px', border:'none', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600,
                background: filtroPlat===p ? AMARELO : '#2A2A2A',
                color: filtroPlat===p ? '#000' : SUBTEXTO,
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { setModoImportar(!modoImportar); setMostrarForm(false); setBuscaPauta('') }} style={{ background:'#2A2A2A', color:TEXTO, border:`1px solid ${BORDA}`, borderRadius:8, padding:'7px 14px', cursor:'pointer', fontWeight:700, fontSize:13 }}>Importar pauta</button>
            <button onClick={() => { setMostrarForm(true); setModoImportar(false); setForm(VAZIO_METRICA) }} style={{ background:AMARELO, color:'#000', border:'none', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontWeight:700, fontSize:13 }}>+ Nova manual</button>
          </div>
        </div>

        {modoImportar && (
          <div style={{ background:'#222', border:`1px solid ${BORDA}`, borderRadius:12, padding:'1.2rem', marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:AMARELO }}>Importar pauta existente</h3>
              <button onClick={() => setModoImportar(false)} style={{ background:'none', border:'none', color:SUBTEXTO, cursor:'pointer', fontSize:16 }}>X</button>
            </div>
            <input type="text" placeholder="Buscar pauta por titulo ou reporter..." value={buscaPauta} onChange={e => setBuscaPauta(e.target.value)} style={{...inp, marginTop:0, marginBottom:12}} />
            <div style={{ maxHeight:240, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
              {pautasFiltradas.length === 0
