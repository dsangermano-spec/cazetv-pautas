'use client'
import { useEffect, useState } from 'react'

const VAZIO_PAUTA = { data: '', dataFim: '', reporter: '', titulo: '', conteudo: '', pdfUrl: '' }
const VAZIO_RELATORIO = { data: '', reporter: '', texto: '' }
const VAZIO_PREVISAO = { data: '', dataFim: '', titulo: '', descricao: '' }
const VAZIO_CONTATO = { nome: '', telefone: '', cargo: '' }
const VAZIO_PEDIDO = { data: '', quem: '', reporter: '', local: '', descricao: '' }
const VAZIO_METRICA = { data: '', titulo: '', reporter: '', plataformas: [], noAr: 'sim', views: '', postsInsta: '', entradasYT: '', entradasProg: '', entradasTrans: '' }

const AMARELO = '#FFD600'
const LARANJA = '#FF6B00'
const ESCURO = '#111111'
const CARD = '#1A1A1A'
const BORDA = '#2A2A2A'
const TEXTO = '#F0F0F0'
const SUBTEXTO = '#888888'
const VERDE = '#4CAF50'

const PLATAFORMAS = ['Instagram', 'YouTube', 'Programas', 'Transmissões']
const CORES_PLAT = [AMARELO, '#E1306C', '#9146FF', '#00b4d8']

const inp = {
  width: '100%', background: '#222', border: '1px solid #2A2A2A',
  borderRadius: 8, padding: '10px 14px', marginTop: 6,
  boxSizing: 'border-box', color: '#F0F0F0', fontSize: 14, outline: 'none',
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

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
  if (!v) return '—'
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
        <button onClick={() => navMes(-1)} style={{ background:CARD, border:`1px solid ${BORDA}`, color:TEXTO, borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:13 }}>←</button>
        <span style={{ fontSize:16, fontWeight:700, color:TEXTO }}>{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)} style={{ background:CARD, border:`1px solid ${BORDA}`, color:TEXTO, borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:13 }}>→</button>
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
              {info.pedidos.slice(0,Math.max(0,MAX-info.pautas.length)).map((p,j) => <div key={j} style={{ background:LARANJA, color:'#fff', borderRadius:4, padding:'2px 5px', fontSize:10, fontWeight:700, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>📥 {p.descricao?.slice(0,15)||'Pedido'}</div>)}
              {info.relatorios.slice(0,Math.max(0,MAX-info.pautas.length-info.pedidos.length)).map((r,j) => <div key={j} style={{ background:'#2A2A2A', color:'#888', border:'0.5px solid #444', borderRadius:4, padding:'2px 5px', fontSize:10, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>📝 {r.reporter}</div>)}
              {info.previsoes.slice(0,Math.max(0,MAX-info.pautas.length-info.pedidos.length-info.relatorios.length)).map((p,j) => <div key={j} style={{ background:'#1a1a2e', color:'#8888ff', border:'0.5px solid #333366', borderRadius:4, padding:'2px 5px', fontSize:10, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>🔭 {p.titulo}</div>)}
              {total>MAX && <div style={{ fontSize:10, color:SUBTEXTO, marginTop:2 }}>+{total-MAX} mais</div>}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop:16, display:'flex', gap:16, flexWrap:'wrap' }}>
        {[{c:AMARELO,l:'Pautas'},{c:LARANJA,l:'Pedidos'},{c:'#2A2A2A',l:'Relatórios',b:'0.5px solid #444'},{c:'#1a1a2e',l:'Previsões',b:'0.5px solid #333366'}].map(({c,l,b}) => (
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

  function getPlats(m) {
    if (Array.isArray(m.plataformas) && m.plataformas.length > 0) return m.plataformas
    if (m.plataforma) return [m.plataforma]
    return []
  }

  function togglePlat(p) {
    const atual = form.plataformas || []
    setForm({ ...form, plataformas: atual.includes(p) ? atual.filter(x => x !== p) : [...atual, p] })
  }

  const pautasFiltradas = (pautas||[]).filter(p =>
    p.titulo.toLowerCase().includes(buscaPauta.toLowerCase()) ||
    (p.reporter||'').toLowerCase().includes(buscaPauta.toLowerCase())
  )

  function importarPauta(p) {
    setForm({ data: p.data, titulo: p.titulo, reporter: p.reporter, plataformas: [], noAr: 'sim', views: '', postsInsta: '', entradasYT: '', entradasProg: '', entradasTrans: '' })
    setModoImportar(false)
    setMostrarForm(true)
  }

  const total = metricas.length
  const noAr = metricas.filter(m => m.noAr === 'sim').length
  const aproveitamento = total > 0 ? Math.round((noAr/total)*100) : 0
  const totalViews = metricas.reduce((acc, m) => acc + (parseInt(m.views)||0), 0)
  const filtradas = filtroPlat === 'Todas' ? metricas : metricas.filter(m => getPlats(m).includes(filtroPlat))

  function iniciarEdicao(m) {
    setForm({ data:m.data, titulo:m.titulo, reporter:m.reporter, plataformas:getPlats(m), noAr:m.noAr, views:m.views||'', postsInsta:m.postsInsta||'', entradasYT:m.entradasYT||'', entradasProg:m.entradasProg||'', entradasTrans:m.entradasTrans||'' })
    setEditando(m.id)
    setMostrarForm(true)
  }

  async function salvar() {
    if (!form.data || !form.titulo) return alert('Preencha data e título.')
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
            const count = metricas.filter(m => getPlats(m).includes(p) && m.noAr === 'sim').length
            const pct = noAr > 0 ? Math.round((count/noAr)*100) : 0
            return (
              <div key={p} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:TEXTO, marginBottom:4 }}>
                  <span>{p}</span><span style={{ color:SUBTEXTO }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background:'#2A2A2A', borderRadius:4, height:8 }}>
                  <div style={{ background:CORES_PLAT[i], borderRadius:4, height:8, width:`${pct}%`, transition:'width 0.3s' }} />
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
            <div style={{ textAlign:'center' }}><div style={{ fontSize:18, fontWeight:700, color:'#ff4444' }}>{total-noAr}</div><div style={{ fontSize:11, color:SUBTEXTO }}>Não entraram</div></div>
          </div>
        </div>
      </div>

      <div style={{ background:CARD, borderRadius:10, padding:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['Todas', ...PLATAFORMAS].map(p => (
              <button key={p} onClick={() => setFiltroPlat(p)} style={{
                padding:'5px 12px', border:'none', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600,
                background: filtroPlat===p ? AMARELO : '#2A2A2A', color: filtroPlat===p ? '#000' : SUBTEXTO,
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { setModoImportar(true); setMostrarForm(false); setBuscaPauta('') }} style={{ background:'#2A2A2A', color:TEXTO, border:`1px solid ${BORDA}`, borderRadius:8, padding:'7px 14px', cursor:'pointer', fontWeight:700, fontSize:13 }}>📋 Importar pauta</button>
            <button onClick={() => { setMostrarForm(true); setModoImportar(false); setForm(VAZIO_METRICA) }} style={{ background:AMARELO, color:'#000', border:'none', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontWeight:700, fontSize:13 }}>+ Nova manual</button>
          </div>
        </div>

        {modoImportar && (
          <div style={{ background:'#222', border:`1px solid ${BORDA}`, borderRadius:12, padding:'1.2rem', marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:AMARELO }}>Importar pauta existente</h3>
              <button onClick={() => setModoImportar(false)} style={{ background:'none', border:'none', color:SUBTEXTO, cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
            <input type="text" placeholder="Buscar pauta por título ou repórter..." value={buscaPauta} onChange={e => setBuscaPauta(e.target.value)} style={{...inp, marginTop:0, marginBottom:12}} autoFocus />
            <div style={{ maxHeight:240, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
              {pautasFiltradas.length === 0 && <p style={{ color:SUBTEXTO, fontSize:13, textAlign:'center', padding:'1rem 0' }}>Nenhuma pauta encontrada.</p>}
              {pautasFiltradas.map(p => (
                <div key={p.id} onClick={() => importarPauta(p)} style={{ background:CARD, border:`1px solid ${BORDA}`, borderRadius:8, padding:'10px 14px', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=AMARELO}
                  onMouseLeave={e => e.currentTarget.style.borderColor=BORDA}>
                  <p style={{ margin:0, fontWeight:700, fontSize:13, color:TEXTO }}>{p.titulo}</p>
                  <p style={{ margin:'3px 0 0', fontSize:11, color:SUBTEXTO }}>👤 {p.reporter} · {formatarDataSimples(p.data)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {mostrarForm && (
          <div style={{ background:'#222', border:`1px solid ${BORDA}`, borderRadius:12, padding:'1.2rem', marginBottom:16 }}>
            <h3 style={{ margin:'0 0 12px', fontSize:14, fontWeight:700, color:AMARELO }}>{editando?'✏️ Editar resultado':'+ Novo resultado'}</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Data</label><input type="date" value={form.data} onChange={e => setForm({...form,data:e.target.value})} style={{...inp,colorScheme:'dark'}} /></div>
              <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Repórter</label><input type="text" placeholder="Nome" value={form.reporter} onChange={e => setForm({...form,reporter:e.target.value})} style={inp} /></div>
            </div>
            <div style={{ marginBottom:10 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Título da pauta</label><input type="text" placeholder="Nome da pauta" value={form.titulo} onChange={e => setForm({...form,titulo:e.target.value})} style={inp} /></div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase', display:'block', marginBottom:8 }}>Plataformas (selecione uma ou mais)</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {PLATAFORMAS.map((p, i) => {
                  const sel = (form.plataformas||[]).includes(p)
                  return (
                    <button key={p} type="button" onClick={() => togglePlat(p)} style={{
                      padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:700,
                      border: sel ? 'none' : `1px solid ${BORDA}`,
                      background: sel ? CORES_PLAT[i] : '#2A2A2A',
                      color: sel ? (p === 'Instagram' ? '#000' : '#fff') : SUBTEXTO,
                    }}>{p}</button>
                  )
                })}
              </div>
              {(form.plataformas||[]).length === 0 && <p style={{ fontSize:11, color:'#555', margin:'6px 0 0' }}>Nenhuma selecionada</p>}
            </div>
            {(form.plataformas||[]).length > 0 && (
              <div style={{ background:'#1a1a1a', border:`1px solid #333`, borderRadius:10, padding:'12px 14px', marginBottom:14 }}>
                <p style={{ fontSize:10, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, margin:'0 0 10px' }}>Detalhes por plataforma</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
                  {(form.plataformas||[]).includes('Instagram') && (
                    <div><label style={{ fontSize:11, color:AMARELO, fontWeight:700, textTransform:'uppercase' }}>Posts Instagram</label><input type="number" placeholder="Qtd. posts" value={form.postsInsta} onChange={e => setForm({...form,postsInsta:e.target.value})} style={inp} /></div>
                  )}
                  {(form.plataformas||[]).includes('YouTube') && (
                    <div><label style={{ fontSize:11, color:'#E1306C', fontWeight:700, textTransform:'uppercase' }}>Entradas YouTube</label><input type="number" placeholder="Qtd. entradas" value={form.entradasYT} onChange={e => setForm({...form,entradasYT:e.target.value})} style={inp} /></div>
                  )}
                  {(form.plataformas||[]).includes('Programas') && (
                    <div><label style={{ fontSize:11, color:'#9146FF', fontWeight:700, textTransform:'uppercase' }}>Entradas Programas</label><input type="number" placeholder="Qtd. entradas" value={form.entradasProg} onChange={e => setForm({...form,entradasProg:e.target.value})} style={inp} /></div>
                  )}
                  {(form.plataformas||[]).includes('Transmissões') && (
                    <div><label style={{ fontSize:11, color:'#00b4d8', fontWeight:700, textTransform:'uppercase' }}>Entradas Transmissões</label><input type="number" placeholder="Qtd. entradas" value={form.entradasTrans} onChange={e => setForm({...form,entradasTrans:e.target.value})} style={inp} /></div>
                  )}
                </div>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Entrou no ar?</label>
                <select value={form.noAr} onChange={e => setForm({...form,noAr:e.target.value})} style={{...inp, cursor:'pointer'}}>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Total de visualizações</label>
                <input type="number" placeholder="Ex: 50000" value={form.views} onChange={e => setForm({...form,views:e.target.value})} style={inp} />
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={salvar} style={{ background:AMARELO, color:'#000', border:'none', borderRadius:8, padding:'9px 18px', cursor:'pointer', fontWeight:700, fontSize:13 }}>{editando?'Salvar edição':'Adicionar'}</button>
              <button onClick={cancelar} style={{ background:'transparent', border:`1px solid ${BORDA}`, borderRadius:8, padding:'9px 18px', cursor:'pointer', color:SUBTEXTO, fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        )}

        {filtradas.length === 0 && !mostrarForm && !modoImportar && <p style={{ color:SUBTEXTO, fontSize:13, textAlign:'center', padding:'2rem 0' }}>Nenhum resultado cadastrado.</p>}

        {filtradas.length > 0 && (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  {['Data','Pauta','Repórter','Plataformas','No ar','Views',''].map(h => (
                    <th key={h} style={{ textAlign:'left', color:SUBTEXTO, fontSize:11, fontWeight:600, textTransform:'uppercase', padding:'6px 8px', borderBottom:`0.5px solid ${BORDA}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.sort((a,b) => b.data.localeCompare(a.data)).map(m => (
                  <tr key={m.id}>
                    <td style={{ padding:'9px 8px', color:SUBTEXTO, borderBottom:`0.5px solid ${BORDA}`, whiteSpace:'nowrap' }}>{formatarDataSimples(m.data)}</td>
                    <td style={{ padding:'9px 8px', color:TEXTO, borderBottom:`0.5px solid ${BORDA}`, maxWidth:200 }}>{m.titulo}</td>
                    <td style={{ padding:'9px 8px', color:SUBTEXTO, borderBottom:`0.5px solid ${BORDA}`, whiteSpace:'nowrap' }}>{m.reporter||'—'}</td>
                    <td style={{ padding:'9px 8px', borderBottom:`0.5px solid ${BORDA}` }}>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {getPlats(m).length > 0
                          ? getPlats(m).map(p => {
                              const i = PLATAFORMAS.indexOf(p)
                              return <span key={p} style={{ background: i >= 0 ? CORES_PLAT[i] : '#2A2A2A', color: p==='Instagram'?'#000':'#fff', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>{p}</span>
                            })
                          : <span style={{ color:SUBTEXTO }}>—</span>
                        }
                      </div>
                    </td>
                    <td style={{ padding:'9px 8px', borderBottom:`0.5px solid ${BORDA}` }}>
                      {m.noAr==='sim'
                        ? <span style={{ background:'#0a2a0a', color:VERDE, border:`0.5px solid ${VERDE}`, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>✓ Sim</span>
                        : <span style={{ background:'#2a0a0a', color:'#ff4444', border:'0.5px solid #ff4444', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>✗ Não</span>
                      }
                    </td>
                    <td style={{ padding:'9px 8px', borderBottom:`0.5px solid ${BORDA}` }}>
                      <div style={{ color:AMARELO, fontWeight:700 }}>{formatViews(m.views)}</div>
                      {m.postsInsta && <div style={{ fontSize:10, color:AMARELO, opacity:0.8 }}>📸 {m.postsInsta} posts</div>}
                      {m.entradasYT && <div style={{ fontSize:10, color:'#E1306C' }}>▶ {m.entradasYT} ent. YT</div>}
                      {m.entradasProg && <div style={{ fontSize:10, color:'#9146FF' }}>📺 {m.entradasProg} ent. Prog</div>}
                      {m.entradasTrans && <div style={{ fontSize:10, color:'#00b4d8' }}>📡 {m.entradasTrans} ent. Trans</div>}
                    </td>
                    <td style={{ padding:'9px 8px', borderBottom:`0.5px solid ${BORDA}`, whiteSpace:'nowrap' }}>
                      <button onClick={() => iniciarEdicao(m)} style={{ background:'none', border:'none', color:AMARELO, cursor:'pointer', fontSize:12, fontWeight:600, marginRight:8 }}>Editar</button>
                      <button onClick={() => onDeletar(m.id)} style={{ background:'none', border:'none', color:'#ff4444', cursor:'pointer', fontSize:12, fontWeight:600 }}>Deletar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  const [pedidos, setPedidos] = useState([])
  const [metricas, setMetricas] = useState([])
  const [busca, setBusca] = useState('')
  const [buscaGeral, setBuscaGeral] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [diaModal, setDiaModal] = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [uploadando, setUploadando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [formContato, setFormContato] = useState(VAZIO_CONTATO)
  const [editandoContato, setEditandoContato] = useState(null)
  const [formPauta, setFormPauta] = useState(VAZIO_PAUTA)
  const [editandoPauta, setEditandoPauta] = useState(null)
  const [formRel, setFormRel] = useState(VAZIO_RELATORIO)
  const [editandoRel, setEditandoRel] = useState(null)
  const [formPrev, setFormPrev] = useState(VAZIO_PREVISAO)
  const [editandoPrev, setEditandoPrev] = useState(null)
  const [formPedido, setFormPedido] = useState(VAZIO_PEDIDO)
  const [editandoPedido, setEditandoPedido] = useState(null)
  const [modalRelatorio, setModalRelatorio] = useState(false)
  const [relatorioGerado, setRelatorioGerado] = useState('')
  const [gerando, setGerando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const hasSidebar = !['contatos','busca','calendario','metricas'].includes(aba)
  const corAba = aba==='pedidos'?LARANJA:AMARELO

  function getDatasUnicas(lista) {
    const set = new Set()
    lista.forEach(item => getDatasNoPeriodo(item.data, item.dataFim).forEach(d => set.add(d)))
    return Array.from(set).sort()
  }
  function getItensDoDia(lista, data) { return lista.filter(item => getDatasNoPeriodo(item.data, item.dataFim).includes(data)) }

  const datasP = getDatasUnicas(pautas)
  const datasR = getDatasUnicas(relatorios)
  const datasV = getDatasUnicas(previsoes)
  const datasPed = [...new Set(pedidos.map(p => p.data))].sort()
  const datas = aba==='pautas'?datasP:aba==='relatorios'?datasR:aba==='previsoes'?datasV:datasPed

  // ✅ CORREÇÃO: itensDoDia agora está definida corretamente
  const itensDoDia = dataSelecionada
    ? aba==='pautas' ? getItensDoDia(pautas, dataSelecionada)
    : aba==='relatorios' ? getItensDoDia(relatorios, dataSelecionada)
    : aba==='previsoes' ? getItensDoDia(previsoes, dataSelecionada)
    : pedidos.filter(p => p.data === dataSelecionada)
    : []

  useEffect(() => { carregarTudo() }, [])

  useEffect(() => {
    if (!hasSidebar) return
    if (datas.length === 0) return
    const hoje = new Date().toISOString().split('T')[0]
    const futura = datas.find(d => d >= hoje)
    setDataSelecionada(futura || datas[datas.length - 1])
  }, [aba, pautas, relatorios, previsoes, pedidos])

  async function carregarTudo() {
    try {
      setLoading(true)
      const [rP, rR, rPrev, rC, rPed, rM] = await Promise.all([
        fetch('/api/pautas').then(r => r.json()),
        fetch('/api/relatorios').then(r => r.json()),
        fetch('/api/previsoes').then(r => r.json()),
        fetch('/api/contatos').then(r => r.json()),
        fetch('/api/pedidos').then(r => r.json()),
        fetch('/api/metricas').then(r => r.json()),
      ])
      setPautas(rP.sort((a,b) => a.data.localeCompare(b.data)))
      setRelatorios(rR.sort((a,b) => a.data.localeCompare(b.data)))
      setPrevisoes(rPrev.sort((a,b) => a.data.localeCompare(b.data)))
      setContatos(rC.sort((a,b) => a.nome.localeCompare(b.nome)))
      setPedidos(rPed.sort((a,b) => a.data.localeCompare(b.data)))
      setMetricas(rM.sort((a,b) => b.data.localeCompare(a.data)))
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }

  async function carregarPautas() { const r = await fetch('/api/pautas'); setPautas((await r.json()).sort((a,b) => a.data.localeCompare(b.data))) }
  async function carregarRelatorios() { const r = await fetch('/api/relatorios'); setRelatorios((await r.json()).sort((a,b) => a.data.localeCompare(b.data))) }
  async function carregarPrevisoes() { const r = await fetch('/api/previsoes'); setPrevisoes((await r.json()).sort((a,b) => a.data.localeCompare(b.data))) }
  async function carregarContatos() { const r = await fetch('/api/contatos'); setContatos((await r.json()).sort((a,b) => a.nome.localeCompare(b.nome))) }
  async function carregarPedidos() { const r = await fetch('/api/pedidos'); setPedidos((await r.json()).sort((a,b) => a.data.localeCompare(b.data))) }
  async function carregarMetricas() { const r = await fetch('/api/metricas'); setMetricas((await r.json()).sort((a,b) => b.data.localeCompare(a.data))) }

  async function gerarRelatorio() {
    setGerando(true)
    setRelatorioGerado('')
    try {
      const res = await fetch('/api/gerar-relatorio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      setRelatorioGerado(data.html || '<p>Erro ao gerar relatório.</p>')
    } catch(e) {
      setRelatorioGerado('<p style="color:red">Erro ao conectar. Tente novamente.</p>')
    }
    setGerando(false)
  }

  function copiarRelatorio() {
    const blob = new Blob([relatorioGerado], { type: 'text/html' })
    const clipItem = new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([relatorioGerado.replace(/<[^>]+>/g, '')], { type: 'text/plain' }) })
    navigator.clipboard.write([clipItem]).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    }).catch(() => {
      const el = document.createElement('div')
      el.innerHTML = relatorioGerado
      document.body.appendChild(el)
      const range = document.createRange()
      range.selectNode(el)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
      document.execCommand('copy')
      window.getSelection().removeAllRanges()
      document.body.removeChild(el)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  function baixarPDF() {
    const hoje = new Date().toISOString().split('T')[0]
    const dataLabel = new Date(hoje + 'T12:00:00').toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })
    const janela = window.open('', '_blank')
    janela.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pautas CazéTV — ${dataLabel}</title>
    <style>body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px 40px; max-width: 680px; margin: 0 auto; }
    @media print { body { padding: 0; } @page { margin: 20mm; } }</style>
    </head><body>${relatorioGerado}</body></html>`)
    janela.document.close()
    janela.focus()
    setTimeout(() => { janela.print() }, 400)
  }

  function enviarWhatsApp(pauta) {
    const contato = contatos.find(c => c.nome.toLowerCase().includes(pauta.reporter.toLowerCase()) || pauta.reporter.toLowerCase().includes(c.nome.toLowerCase()))
    const tel = contato ? limparTelefone(contato.telefone) : ''
    const periodo = pauta.dataFim && pauta.dataFim !== pauta.data ? `📅 ${formatarDataSimples(pauta.data)} até ${formatarDataSimples(pauta.dataFim)} (${diffDias(pauta.data, pauta.dataFim)} dias)` : `📅 ${formatarData(pauta.data)}`
    const msg = `📋 *PAUTA - CazéTV*\n${periodo}\n👤 Repórter: ${pauta.reporter}\n\n*${pauta.titulo}*${pauta.conteudo?'\n\n'+pauta.conteudo:''}${pauta.pdfUrl?'\n\n📄 PDF: '+pauta.pdfUrl:''}`
    window.open(tel?`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank')
  }

  async function converterEmPauta(pedido) {
    if (!confirm('Converter em pauta?')) return
    await fetch('/api/pautas', { method:'POST', body:JSON.stringify({ data:pedido.data, dataFim:pedido.data, reporter:pedido.reporter||'', titulo:pedido.descricao?.slice(0,80)||'Pauta sem título', conteudo:`${pedido.descricao||''}\n\n📍 Local: ${pedido.local||''}\n👤 Solicitado por: ${pedido.quem||''}`, pdfUrl:'' }) })
    await fetch('/api/pedidos', { method:'DELETE', body:JSON.stringify({ id:pedido.id }) })
    carregarPautas(); carregarPedidos(); setAba('pautas'); setDataSelecionada(pedido.data)
  }

  const contatosFiltrados = contatos.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase())||(c.cargo||'').toLowerCase().includes(busca.toLowerCase()))
  const q = buscaGeral.toLowerCase()
  const pautasEncontradas = q?pautas.filter(p=>(p.titulo||'').toLowerCase().includes(q)||(p.conteudo||'').toLowerCase().includes(q)||(p.reporter||'').toLowerCase().includes(q)):[]
  const relatoriosEncontrados = q?relatorios.filter(r=>(r.texto||'').toLowerCase().includes(q)||(r.reporter||'').toLowerCase().includes(q)):[]
  const previsoesEncontradas = q?previsoes.filter(p=>(p.titulo||'').toLowerCase().includes(q)||(p.descricao||'').toLowerCase().includes(q)):[]

  async function handlePdf(e) {
    const file = e.target.files[0]; if (!file) return
    setUploadando(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method:'POST', body:fd })
    const data = await res.json()
    setFormPauta(f => ({ ...f, pdfUrl: data.url }))
    setUploadando(false)
  }

  async function salvarPauta() {
    if (!formPauta.data||!formPauta.reporter||!formPauta.titulo) return alert('Preencha data, repórter e título.')
    const payload = { ...formPauta, dataFim:formPauta.dataFim||formPauta.data }
    if (editandoPauta) { await fetch('/api/pautas',{method:'PUT',body:JSON.stringify({...payload,id:editandoPauta})}); setEditandoPauta(null) }
    else await fetch('/api/pautas',{method:'POST',body:JSON.stringify(payload)})
    setDataSelecionada(formPauta.data); setFormPauta(VAZIO_PAUTA); setMostrarForm(false); carregarPautas()
  }
  async function deletarPauta(id) { if(!confirm('Deletar?'))return; await fetch('/api/pautas',{method:'DELETE',body:JSON.stringify({id})}); carregarPautas() }
  function editarPauta(p) { setFormPauta({data:p.data,dataFim:p.dataFim||'',reporter:p.reporter,titulo:p.titulo,conteudo:p.conteudo,pdfUrl:p.pdfUrl||''}); setEditandoPauta(p.id); setMostrarForm(true); window.scrollTo({top:0,behavior:'smooth'}) }

  async function salvarRelatorio() {
    if (!formRel.data||!formRel.reporter||!formRel.texto) return alert('Preencha data, repórter e relatório.')
    if (editandoRel) { await fetch('/api/relatorios',{method:'PUT',body:JSON.stringify({...formRel,id:editandoRel})}); setEditandoRel(null) }
    else await fetch('/api/relatorios',{method:'POST',body:JSON.stringify(formRel)})
    setDataSelecionada(formRel.data); setFormRel(VAZIO_RELATORIO); setMostrarForm(false); carregarRelatorios()
  }
  async function deletarRelatorio(id) { if(!confirm('Deletar?'))return; await fetch('/api/relatorios',{method:'DELETE',body:JSON.stringify({id})}); carregarRelatorios() }
  function editarRelatorio(r) { setFormRel({data:r.data,reporter:r.reporter,texto:r.texto}); setEditandoRel(r.id); setMostrarForm(true); window.scrollTo({top:0,behavior:'smooth'}) }

  async function salvarPrevisao() {
    if (!formPrev.data||!formPrev.titulo) return alert('Preencha data e título.')
    const payload = { ...formPrev, dataFim:formPrev.dataFim||formPrev.data }
    if (editandoPrev) { await fetch('/api/previsoes',{method:'PUT',body:JSON.stringify({...payload,id:editandoPrev})}); setEditandoPrev(null) }
    else await fetch('/api/previsoes',{method:'POST',body:JSON.stringify(payload)})
    setDataSelecionada(formPrev.data); setFormPrev(VAZIO_PREVISAO); setMostrarForm(false); carregarPrevisoes()
  }
  async function deletarPrevisao(id) { if(!confirm('Deletar?'))return; await fetch('/api/previsoes',{method:'DELETE',body:JSON.stringify({id})}); carregarPrevisoes() }
  function editarPrevisao(p) { setFormPrev({data:p.data,dataFim:p.dataFim||'',titulo:p.titulo,descricao:p.descricao||''}); setEditandoPrev(p.id); setMostrarForm(true); window.scrollTo({top:0,behavior:'smooth'}) }

  async function salvarPedido() {
    if (!formPedido.data||!formPedido.quem||!formPedido.descricao) return alert('Preencha data, quem pediu e descrição.')
    if (editandoPedido) { await fetch('/api/pedidos',{method:'PUT',body:JSON.stringify({...formPedido,id:editandoPedido})}); setEditandoPedido(null) }
    else await fetch('/api/pedidos',{method:'POST',body:JSON.stringify(formPedido)})
    setDataSelecionada(formPedido.data); setFormPedido(VAZIO_PEDIDO); setMostrarForm(false); carregarPedidos()
  }
  async function deletarPedido(id) { if(!confirm('Deletar?'))return; await fetch('/api/pedidos',{method:'DELETE',body:JSON.stringify({id})}); carregarPedidos() }
  function editarPedido(p) { setFormPedido({data:p.data,quem:p.quem,reporter:p.reporter||'',local:p.local||'',descricao:p.descricao}); setEditandoPedido(p.id); setMostrarForm(true); window.scrollTo({top:0,behavior:'smooth'}) }

  async function salvarContato() {
    if (!formContato.nome||!formContato.telefone) return alert('Preencha nome e telefone.')
    if (editandoContato) { await fetch('/api/contatos',{method:'PUT',body:JSON.stringify({...formContato,id:editandoContato})}); setEditandoContato(null) }
    else await fetch('/api/contatos',{method:'POST',body:JSON.stringify(formContato)})
    setFormContato(VAZIO_CONTATO); setMostrarForm(false); carregarContatos()
  }
  async function deletarContato(id) { if(!confirm('Deletar?'))return; await fetch('/api/contatos',{method:'DELETE',body:JSON.stringify({id})}); carregarContatos() }
  function editarContato(c) { setFormContato({nome:c.nome,telefone:c.telefone,cargo:c.cargo||''}); setEditandoContato(c.id); setMostrarForm(true) }

  function cancelar() {
    setFormPauta(VAZIO_PAUTA); setFormRel(VAZIO_RELATORIO); setFormPrev(VAZIO_PREVISAO)
    setFormContato(VAZIO_CONTATO); setFormPedido(VAZIO_PEDIDO)
    setEditandoPauta(null); setEditandoRel(null); setEditandoPrev(null)
    setEditandoContato(null); setEditandoPedido(null); setMostrarForm(false)
  }

  const abas = [
    { id:'pautas', label:'📋 Pautas', cor:AMARELO },
    { id:'relatorios', label:'📝 Relatórios', cor:AMARELO },
    { id:'previsoes', label:'🔭 Previsões', cor:AMARELO },
    { id:'pedidos', label:'📥 Pedidos', cor:LARANJA },
    { id:'contatos', label:'📞 Contatos', cor:AMARELO },
    { id:'busca', label:'🔍 Busca', cor:AMARELO },
    { id:'calendario', label:'📅 Calendário', cor:AMARELO },
    { id:'metricas', label:'📊 Métricas', cor:AMARELO },
  ]

  const labelAbaSel = aba==='pautas'?'Nenhuma pauta selecionada':aba==='relatorios'?'Nenhum relatório selecionado':aba==='previsoes'?'Nenhuma previsão selecionada':'Nenhum pedido selecionado'
  const labelAbaPlural = aba==='pautas'?'pautas':aba==='relatorios'?'relatórios':aba==='previsoes'?'previsões':'pedidos'
  const iconeAba = aba==='pautas'?'📋':aba==='relatorios'?'📝':aba==='previsoes'?'🔭':'📥'

  function PeriodoTag({ item }) {
    if (!item.dataFim||item.dataFim===item.data) return null
    return <span style={{ display:'inline-block', background:'#2A2A2A', color:AMARELO, border:`0.5px solid ${AMARELO}`, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700, marginTop:6 }}>🗓 {formatarDataSimples(item.data)} → {formatarDataSimples(item.dataFim)} · {diffDias(item.data,item.dataFim)} dias</span>
  }

  function DiaInfo({ item, diaAtual }) {
    if (!item.dataFim||item.dataFim===item.data) return null
    const ds = getDatasNoPeriodo(item.data,item.dataFim)
    return <span style={{ fontSize:11, color:SUBTEXTO, marginLeft:8 }}>dia {ds.indexOf(diaAtual)+1} de {ds.length}</span>
  }

  function FormDataPeriodo({ dataInicio, dataFim, onChangeInicio, onChangeFim }) {
    const dias = dataInicio?diffDias(dataInicio,dataFim||dataInicio):0
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Data início</label><input type="date" value={dataInicio} onChange={e => onChangeInicio(e.target.value)} style={{...inp,colorScheme:'dark'}} /></div>
        <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Data fim <span style={{ color:'#555', fontWeight:400, textTransform:'none' }}>(opcional)</span></label><input type="date" value={dataFim} min={dataInicio} onChange={e => onChangeFim(e.target.value)} style={{...inp,colorScheme:'dark'}} /></div>
        {dataInicio&&dataFim&&dataFim!==dataInicio&&<div style={{ gridColumn:'1/-1', marginTop:-6 }}><span style={{ fontSize:11, color:AMARELO, fontWeight:600 }}>✓ {dias} dias ({formatarDataSimples(dataInicio)} → {formatarDataSimples(dataFim)})</span></div>}
      </div>
    )
  }

  function CardPauta({ p }) {
    const contato = contatos.find(c => c.nome.toLowerCase().includes(p.reporter.toLowerCase())||p.reporter.toLowerCase().includes(c.nome.toLowerCase()))
    return (
      <div style={{ background:CARD, border:`1px solid ${BORDA}`, borderRadius:12, padding:'1rem 1.2rem' }}
        onMouseEnter={e => e.currentTarget.style.borderColor=AMARELO}
        onMouseLeave={e => e.currentTarget.style.borderColor=BORDA}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <div><p style={{ margin:0, fontWeight:700, fontSize:15 }}>{p.titulo}</p><p style={{ margin:'4px 0 0', fontSize:13, color:SUBTEXTO }}>👤 {p.reporter}{dataSelecionada&&<DiaInfo item={p} diaAtual={dataSelecionada}/>}</p><PeriodoTag item={p}/></div>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start', flexShrink:0, marginLeft:12 }}>
            <button onClick={() => enviarWhatsApp(p)} style={{ background:'#25D366', color:'#fff', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:700 }}>📲 {contato?'Enviar':'WhatsApp'}</button>
            <button onClick={() => editarPauta(p)} style={{ background:'none', border:'none', color:AMARELO, cursor:'pointer', fontSize:13, fontWeight:600 }}>Editar</button>
            <button onClick={() => deletarPauta(p.id)} style={{ background:'none', border:'none', color:'#ff4444', cursor:'pointer', fontSize:13, fontWeight:600 }}>Deletar</button>
          </div>
        </div>
        <div style={{ marginTop:10, display:'flex', gap:16, flexWrap:'wrap' }}>
          {p.conteudo&&<button onClick={() => setExpandido(expandido===p.id?null:p.id)} style={{ background:'none', border:'none', color:SUBTEXTO, cursor:'pointer', fontSize:12, padding:0, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{expandido===p.id?'▲ Ocultar':'▼ Ver pauta completa'}</button>}
          {p.pdfUrl&&<a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, fontWeight:600, color:AMARELO, textDecoration:'none', textTransform:'uppercase', letterSpacing:0.5 }}>📄 Ver PDF</a>}
        </div>
        {expandido===p.id&&p.conteudo&&<p style={{ marginTop:10, fontSize:14, color:'#ccc', whiteSpace:'pre-wrap', background:'#222', borderRadius:8, padding:'12px 14px', lineHeight:1.7, borderLeft:`3px solid ${AMARELO}` }}>{p.conteudo}</p>}
      </div>
    )
  }

  function EmptyState() {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, minHeight:0, padding:'3rem 2rem', gap:20, textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:20, background:'#1E1E1E', border:`1.5px dashed ${BORDA}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>{iconeAba}</div>
        <div>
          <p style={{ margin:0, fontSize:16, fontWeight:700, color:TEXTO }}>{labelAbaSel}</p>
          <p style={{ margin:'6px 0 0', fontSize:13, color:SUBTEXTO, maxWidth:280, lineHeight:1.6 }}>Escolha uma data na lateral para ver os {labelAbaPlural}, ou crie um novo registro.</p>
        </div>
        <button onClick={() => setMostrarForm(true)} style={{ background:corAba, color:aba==='pedidos'?'#fff':'#000', border:'none', borderRadius:10, padding:'11px 24px', cursor:'pointer', fontWeight:700, fontSize:14, boxShadow:`0 0 20px ${corAba}33` }}>
          + {aba==='pautas'?'Nova pauta':aba==='relatorios'?'Novo relatório':aba==='previsoes'?'Nova previsão':'Novo pedido'}
        </button>
        {datas.length > 0 && <p style={{ margin:0, fontSize:12, color:'#444' }}>{datas.length} {datas.length===1?'data':'datas'} com {labelAbaPlural} cadastrados</p>}
      </div>
    )
  }

  return (
    <main style={{ minHeight:'100vh', background:ESCURO, color:TEXTO, fontFamily:"'Inter','Helvetica Neue',sans-serif", display:'flex', flexDirection:'column' }}>

      <header style={{ background:'#000', borderBottom:`3px solid ${AMARELO}`, padding:'0.85rem 1.5rem', display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
        <span style={{ background:AMARELO, color:'#000', fontWeight:900, fontSize:17, padding:'5px 11px', borderRadius:7, letterSpacing:-0.5 }}>CazéTV</span>
        <span style={{ fontWeight:700, fontSize:16, color:TEXTO, letterSpacing:0.3 }}>PAUTAS & RELATÓRIOS</span>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={() => { setModalRelatorio(true); gerarRelatorio() }} style={{ background:AMARELO, color:'#000', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontWeight:700, fontSize:13 }}>
            📋 Relatório do dia
          </button>
        </div>
      </header>

      {modalRelatorio && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }} onClick={() => setModalRelatorio(false)}>
          <div style={{ background:'#1A1A1A', border:`1px solid ${BORDA}`, borderRadius:16, width:'90%', maxWidth:680, maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${BORDA}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <span style={{ fontWeight:700, fontSize:15, color:AMARELO }}>📋 Relatório do dia</span>
              <button onClick={() => setModalRelatorio(false)} style={{ background:'none', border:'none', color:SUBTEXTO, cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
            <div style={{ overflowY:'auto', padding:'20px', background:'#fff', color:'#111', fontFamily:'Arial, sans-serif', fontSize:14, lineHeight:1.6 }}>
              {gerando && (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:200, gap:12 }}>
                  <div style={{ width:32, height:32, border:'3px solid #eee', borderTop:`3px solid ${AMARELO}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  <p style={{ color:'#888', fontSize:13 }}>Gerando relatório...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              )}
              {!gerando && relatorioGerado && <div dangerouslySetInnerHTML={{ __html: relatorioGerado }} />}
            </div>
            {!gerando && relatorioGerado && (
              <div style={{ padding:'14px 20px', borderTop:`1px solid ${BORDA}`, flexShrink:0, background:'#111', display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button onClick={() => setModalRelatorio(false)} style={{ background:'transparent', border:`1px solid ${BORDA}`, borderRadius:8, padding:'9px 18px', cursor:'pointer', color:SUBTEXTO, fontSize:13 }}>Fechar</button>
                <button onClick={() => gerarRelatorio()} style={{ background:'#222', border:`1px solid ${BORDA}`, borderRadius:8, padding:'9px 18px', cursor:'pointer', color:TEXTO, fontSize:13, fontWeight:600 }}>🔄 Regerar</button>
                <button onClick={copiarRelatorio} style={{ background: copiado ? VERDE : '#222', color: copiado ? '#fff' : TEXTO, border:`1px solid ${copiado ? VERDE : BORDA}`, borderRadius:8, padding:'9px 18px', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.2s' }}>{copiado ? '✅ Copiado!' : '📋 Copiar'}</button>
                <button onClick={baixarPDF} style={{ background:AMARELO, color:'#000', border:'none', borderRadius:8, padding:'9px 20px', cursor:'pointer', fontWeight:700, fontSize:13 }}>⬇️ Baixar PDF</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:2, padding:'6px 10px', background:'#0A0A0A', borderBottom:`1px solid ${BORDA}`, flexShrink:0, flexWrap:'wrap' }}>
        {abas.map(a => (
          <button key={a.id} onClick={() => { setAba(a.id); setDataSelecionada(null); setMostrarForm(false); setBusca(''); setBuscaGeral('') }} style={{
            padding:'7px 16px', border:'none', borderRadius:7, cursor:'pointer', fontWeight:700, fontSize:13,
            background: aba===a.id ? a.cor : 'transparent',
            color: aba===a.id ? (a.id==='pedidos'?'#fff':'#000') : SUBTEXTO,
            transition:'all 0.15s',
          }}>{a.label}</button>
        ))}
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

        {hasSidebar && (
          <aside style={{ width:220, flexShrink:0, borderRight:`1px solid ${BORDA}`, padding:'12px 8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:4, background:'#0D0D0D' }}>
            <p style={{ fontSize:10, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase', letterSpacing:1, padding:'0 6px', margin:'0 0 6px' }}>Datas</p>
            {loading && (
              <div style={{ padding:'0 6px', display:'flex', flexDirection:'column', gap:6 }}>
                {[1,2,3].map(i => <div key={i} style={{ height:44, background:CARD, borderRadius:8, opacity:0.5 }} />)}
              </div>
            )}
            {!loading && datas.length === 0 && (
              <div style={{ padding:'1.5rem 6px', textAlign:'center' }}>
                <p style={{ fontSize:12, color:SUBTEXTO, margin:0, lineHeight:1.6 }}>Nenhum registro ainda.</p>
              </div>
            )}
            {datas.map(d => {
              const count = aba==='pautas'?getItensDoDia(pautas,d).length:aba==='relatorios'?getItensDoDia(relatorios,d).length:aba==='previsoes'?getItensDoDia(previsoes,d).length:pedidos.filter(p=>p.data===d).length
              const isActive = dataSelecionada===d
              return (
                <button key={d} onClick={() => { setDataSelecionada(d); setMostrarForm(false) }} style={{
                  width:'100%', textAlign:'left', border:'none', borderRadius:8, padding:'9px 12px', cursor:'pointer',
                  background: isActive ? corAba : CARD,
                  color: isActive ? (aba==='pedidos'?'#fff':'#000') : TEXTO,
                  outline: isActive ? 'none' : `1px solid ${BORDA}`,
                  transition:'all 0.1s',
                }}>
                  <span style={{ display:'block', fontSize:13, fontWeight:700 }}>{formatarDataCurta(d)}</span>
                  <span style={{ display:'block', fontSize:11, opacity:0.65, marginTop:2 }}>{count} {aba==='pautas'?'pauta(s)':aba==='relatorios'?'relatório(s)':aba==='previsoes'?'previsão(ões)':'pedido(s)'}</span>
                </button>
              )
            })}
            <button onClick={() => { setMostrarForm(true); setDataSelecionada(null); cancelar() }} style={{ marginTop:8, width:'100%', padding:'7px 0', background:'transparent', border:`1px dashed #333`, borderRadius:8, color:'#555', fontSize:11, cursor:'pointer' }}>+ nova data</button>
          </aside>
        )}

        {aba === 'metricas' && (
          <AbaMetricas
            metricas={metricas} pautas={pautas}
            onSalvar={async (m) => { await fetch('/api/metricas',{method:'POST',body:JSON.stringify(m)}); carregarMetricas() }}
            onEditar={async (m) => { await fetch('/api/metricas',{method:'PUT',body:JSON.stringify(m)}); carregarMetricas() }}
            onDeletar={async (id) => { if(!confirm('Deletar?'))return; await fetch('/api/metricas',{method:'DELETE',body:JSON.stringify({id})}); carregarMetricas() }}
          />
        )}

        {aba !== 'metricas' && (
          <section style={{ flex:1, overflowY:'auto', padding:'1.5rem', display:'flex', flexDirection:'column' }}>

            {aba==='calendario' && (
              <>
                <Calendario pautas={pautas} relatorios={relatorios} previsoes={previsoes} pedidos={pedidos} onDiaClick={setDiaModal}/>
                {diaModal && (
                  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={() => setDiaModal(null)}>
                    <div style={{ background:'#1A1A1A', border:`1px solid ${BORDA}`, borderRadius:16, padding:'1.5rem', maxWidth:500, width:'90%', maxHeight:'80vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                        <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:AMARELO }}>{formatarData(diaModal.str)}</h3>
                        <button onClick={() => setDiaModal(null)} style={{ background:'none', border:'none', color:SUBTEXTO, cursor:'pointer', fontSize:18 }}>✕</button>
                      </div>
                      {diaModal.pautas?.length>0&&<><p style={{ fontSize:11, fontWeight:700, color:SUBTEXTO, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>📋 Pautas</p>{diaModal.pautas.map(p=><div key={p.id} style={{ background:'#222', borderRadius:10, padding:'10px 14px', marginBottom:8 }}><p style={{ margin:0, fontWeight:700, fontSize:14 }}>{p.titulo}</p><p style={{ margin:'4px 0 0', fontSize:12, color:SUBTEXTO }}>👤 {p.reporter}</p>{p.conteudo&&<p style={{ margin:'8px 0 0', fontSize:13, color:'#aaa', lineHeight:1.5, whiteSpace:'pre-wrap' }}>{p.conteudo}</p>}<div style={{ marginTop:10 }}><button onClick={() => enviarWhatsApp(p)} style={{ background:'#25D366', color:'#fff', border:'none', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontSize:12, fontWeight:700 }}>📲 WhatsApp</button></div></div>)}</>}
                      {diaModal.pedidos?.length>0&&<><p style={{ fontSize:11, fontWeight:700, color:LARANJA, textTransform:'uppercase', letterSpacing:1, marginBottom:8, marginTop:12 }}>📥 Pedidos</p>{diaModal.pedidos.map(p=><div key={p.id} style={{ background:'#222', border:`0.5px solid ${LARANJA}`, borderRadius:10, padding:'10px 14px', marginBottom:8 }}><p style={{ margin:0, fontWeight:700, fontSize:14 }}>{p.descricao}</p><p style={{ margin:'4px 0 0', fontSize:12, color:SUBTEXTO }}>👤 {p.quem}{p.reporter&&` · 🎙️ ${p.reporter}`}{p.local&&` · 📍 ${p.local}`}</p><button onClick={() => { converterEmPauta(p); setDiaModal(null) }} style={{ marginTop:10, background:AMARELO, color:'#000', border:'none', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontSize:12, fontWeight:700 }}>✅ Converter em pauta</button></div>)}</>}
                      {diaModal.relatorios?.length>0&&<><p style={{ fontSize:11, fontWeight:700, color:SUBTEXTO, textTransform:'uppercase', letterSpacing:1, marginBottom:8, marginTop:12 }}>📝 Relatórios</p>{diaModal.relatorios.map(r=><div key={r.id} style={{ background:'#222', borderRadius:10, padding:'10px 14px', marginBottom:8 }}><p style={{ margin:0, fontSize:12, color:SUBTEXTO }}>👤 {r.reporter}</p><p style={{ margin:'8px 0 0', fontSize:13, color:'#aaa', whiteSpace:'pre-wrap', lineHeight:1.5 }}>{r.texto}</p></div>)}</>}
                      {diaModal.previsoes?.length>0&&<><p style={{ fontSize:11, fontWeight:700, color:SUBTEXTO, textTransform:'uppercase', letterSpacing:1, marginBottom:8, marginTop:12 }}>🔭 Previsões</p>{diaModal.previsoes.map(p=><div key={p.id} style={{ background:'#222', borderRadius:10, padding:'10px 14px', marginBottom:8 }}><p style={{ margin:0, fontWeight:700, fontSize:14 }}>{p.titulo}</p>{p.descricao&&<p style={{ margin:'8px 0 0', fontSize:13, color:'#aaa', whiteSpace:'pre-wrap', lineHeight:1.5 }}>{p.descricao}</p>}</div>)}</>}
                    </div>
                  </div>
                )}
              </>
            )}

            {aba==='busca' && (
              <>
                <input type="text" placeholder="🔍 Digite uma palavra para buscar..." value={buscaGeral} onChange={e => setBuscaGeral(e.target.value)} autoFocus style={{...inp,marginTop:0,marginBottom:'1.5rem',fontSize:15}}/>
                {!buscaGeral&&<p style={{ color:SUBTEXTO, fontSize:14, textAlign:'center', padding:'3rem 0' }}>Digite algo para começar a busca.</p>}
                {buscaGeral&&(<>
                  {[
                    {label:'Pautas',items:pautasEncontradas,render:p=><><p style={{ margin:0, fontWeight:700, fontSize:14 }}><Highlight text={p.titulo} busca={buscaGeral}/></p><p style={{ margin:'4px 0 0', fontSize:12, color:SUBTEXTO }}>👤 <Highlight text={p.reporter} busca={buscaGeral}/> · 📅 {formatarDataSimples(p.data)}{p.dataFim&&p.dataFim!==p.data?` → ${formatarDataSimples(p.dataFim)}`:''}</p>{p.conteudo&&<p style={{ margin:'8px 0 0', fontSize:13, color:'#aaa', lineHeight:1.5 }}><Highlight text={p.conteudo.slice(0,150)+(p.conteudo.length>150?'..':'')} busca={buscaGeral}/></p>}</>},
                    {label:'Relatórios',items:relatoriosEncontrados,render:r=><><p style={{ margin:0, fontSize:12, color:SUBTEXTO }}>👤 <Highlight text={r.reporter} busca={buscaGeral}/> · 📅 {formatarDataCurta(r.data)}</p><p style={{ margin:'8px 0 0', fontSize:13, color:'#aaa', lineHeight:1.5 }}><Highlight text={r.texto.slice(0,150)+(r.texto.length>150?'..':'')} busca={buscaGeral}/></p></>},
                    {label:'Previsões',items:previsoesEncontradas,render:p=><><p style={{ margin:0, fontWeight:700, fontSize:14 }}><Highlight text={p.titulo} busca={buscaGeral}/></p><p style={{ margin:'4px 0 0', fontSize:12, color:SUBTEXTO }}>📅 {formatarDataSimples(p.data)}{p.dataFim&&p.dataFim!==p.data?` → ${formatarDataSimples(p.dataFim)}`:''}</p>{p.descricao&&<p style={{ margin:'8px 0 0', fontSize:13, color:'#aaa', lineHeight:1.5 }}><Highlight text={p.descricao.slice(0,150)+(p.descricao.length>150?'..':'')} busca={buscaGeral}/></p>}</>},
                  ].map(({label,items,render}) => (
                    <div key={label} style={{ marginBottom:'1.5rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        <div style={{ width:4, height:16, background:AMARELO, borderRadius:2 }}/>
                        <span style={{ fontSize:12, fontWeight:700, color:SUBTEXTO, textTransform:'uppercase', letterSpacing:1 }}>{label}</span>
                        <span style={{ fontSize:11, color:'#555', marginLeft:4 }}>{items.length} resultado(s)</span>
                      </div>
                      {items.length===0&&<p style={{ color:SUBTEXTO, fontSize:13 }}>Nenhum resultado.</p>}
                      {items.map(item=><div key={item.id} style={{ background:CARD, border:`1px solid ${BORDA}`, borderRadius:12, padding:'1rem 1.2rem', marginBottom:8 }} onMouseEnter={e=>e.currentTarget.style.borderColor=AMARELO} onMouseLeave={e=>e.currentTarget.style.borderColor=BORDA}>{render(item)}</div>)}
                    </div>
                  ))}
                </>)}
              </>
            )}

            {aba==='contatos' && (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 }}>
                  <input type="text" placeholder="🔍 Buscar por nome ou cargo..." value={busca} onChange={e => setBusca(e.target.value)} style={{...inp,marginTop:0,flex:1,minWidth:200,maxWidth:400}}/>
                  <button onClick={() => { setMostrarForm(true); setFormContato(VAZIO_CONTATO) }} style={{ background:AMARELO, color:'#000', border:'none', borderRadius:8, padding:'10px 16px', cursor:'pointer', fontWeight:700, fontSize:13 }}>+ Novo contato</button>
                </div>
                {mostrarForm&&(
                  <div style={{ background:CARD, border:`1px solid ${BORDA}`, borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem' }}>
                    <h2 style={{ margin:'0 0 1rem', fontSize:15, fontWeight:700, color:AMARELO }}>{editandoContato?'✏️ Editar contato':'+ Novo contato'}</h2>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                      <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Nome</label><input type="text" placeholder="Nome completo" value={formContato.nome} onChange={e=>setFormContato({...formContato,nome:e.target.value})} style={inp}/></div>
                      <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Telefone</label><input type="text" placeholder="(xx) xxxxx-xxxx" value={formContato.telefone} onChange={e=>setFormContato({...formContato,telefone:e.target.value})} style={inp}/></div>
                    </div>
                    <div style={{ marginBottom:16 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Cargo / Função</label><input type="text" placeholder="Ex: Repórter, Editor..." value={formContato.cargo} onChange={e=>setFormContato({...formContato,cargo:e.target.value})} style={inp}/></div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={salvarContato} style={{ background:AMARELO, color:'#000', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:700, fontSize:14 }}>{editandoContato?'Salvar edição':'Adicionar'}</button>
                      <button onClick={cancelar} style={{ background:'transparent', border:`1px solid ${BORDA}`, borderRadius:8, padding:'10px 20px', cursor:'pointer', color:SUBTEXTO, fontSize:14 }}>Cancelar</button>
                    </div>
                  </div>
                )}
                <p style={{ fontSize:12, color:SUBTEXTO, marginBottom:12 }}>{contatosFiltrados.length} contato(s)</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:10 }}>
                  {contatosFiltrados.map(c=>(
                    <div key={c.id} style={{ background:CARD, border:`1px solid ${BORDA}`, borderRadius:12, padding:'1rem 1.2rem' }} onMouseEnter={e=>e.currentTarget.style.borderColor=AMARELO} onMouseLeave={e=>e.currentTarget.style.borderColor=BORDA}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div><p style={{ margin:0, fontWeight:700, fontSize:14 }}>{c.nome}</p>{c.cargo&&<p style={{ margin:'3px 0 0', fontSize:12, color:SUBTEXTO }}>{c.cargo}</p>}<p style={{ margin:'6px 0 0', fontSize:13, color:AMARELO, fontWeight:600 }}>{c.telefone}</p></div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6, marginLeft:8 }}>
                          <button onClick={()=>editarContato(c)} style={{ background:'none', border:'none', color:AMARELO, cursor:'pointer', fontSize:12, fontWeight:600 }}>Editar</button>
                          <button onClick={()=>deletarContato(c.id)} style={{ background:'none', border:'none', color:'#ff4444', cursor:'pointer', fontSize:12, fontWeight:600 }}>Deletar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {hasSidebar && mostrarForm && (
              <div style={{ background:CARD, border:`1px solid ${aba==='pedidos'?LARANJA:BORDA}`, borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem' }}>
                <h2 style={{ margin:'0 0 1rem', fontSize:15, fontWeight:700, color:corAba }}>{(editandoPauta||editandoRel||editandoPrev||editandoPedido)?'✏️ Editar':`+ ${aba==='pautas'?'Nova Pauta':aba==='relatorios'?'Novo Relatório':aba==='previsoes'?'Nova Previsão':'Novo Pedido'}`}</h2>
                {aba==='pautas'&&(<>
                  <FormDataPeriodo dataInicio={formPauta.data} dataFim={formPauta.dataFim} onChangeInicio={v=>setFormPauta({...formPauta,data:v})} onChangeFim={v=>setFormPauta({...formPauta,dataFim:v})}/>
                  <div style={{ marginBottom:12 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Repórter</label><input type="text" placeholder="Nome" value={formPauta.reporter} onChange={e=>setFormPauta({...formPauta,reporter:e.target.value})} style={inp}/></div>
                  <div style={{ marginBottom:12 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Título</label><input type="text" placeholder="Título resumido" value={formPauta.titulo} onChange={e=>setFormPauta({...formPauta,titulo:e.target.value})} style={inp}/></div>
                  <div style={{ marginBottom:12 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Pauta completa</label><textarea placeholder="Descreva a pauta..." value={formPauta.conteudo} onChange={e=>setFormPauta({...formPauta,conteudo:e.target.value})} rows={5} style={{...inp,resize:'vertical',lineHeight:1.6}}/></div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Anexar PDF</label>
                    <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:10 }}>
                      <label style={{ background:'#222', border:`1px solid ${BORDA}`, borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, color:SUBTEXTO, fontWeight:600 }}>
                        {uploadando?'Enviando...':formPauta.pdfUrl?'✅ PDF anexado':'📎 Escolher PDF'}
                        <input type="file" accept="application/pdf" onChange={handlePdf} style={{ display:'none' }}/>
                      </label>
                      {formPauta.pdfUrl&&<button onClick={()=>setFormPauta(f=>({...f,pdfUrl:''}))} style={{ background:'none', border:'none', color:'#ff4444', cursor:'pointer', fontSize:13, fontWeight:600 }}>Remover</button>}
                    </div>
                  </div>
                </>)}
                {aba==='relatorios'&&(<>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Data</label><input type="date" value={formRel.data} onChange={e=>setFormRel({...formRel,data:e.target.value})} style={{...inp,colorScheme:'dark'}}/></div>
                    <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Repórter</label><input type="text" placeholder="Nome" value={formRel.reporter} onChange={e=>setFormRel({...formRel,reporter:e.target.value})} style={inp}/></div>
                  </div>
                  <div style={{ marginBottom:16 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Relatório</label><textarea placeholder="O que aconteceu hoje..." value={formRel.texto} onChange={e=>setFormRel({...formRel,texto:e.target.value})} rows={3} style={{...inp,resize:'vertical',lineHeight:1.6}}/></div>
                </>)}
                {aba==='previsoes'&&(<>
                  <FormDataPeriodo dataInicio={formPrev.data} dataFim={formPrev.dataFim} onChangeInicio={v=>setFormPrev({...formPrev,data:v})} onChangeFim={v=>setFormPrev({...formPrev,dataFim:v})}/>
                  <div style={{ marginBottom:12 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Título</label><input type="text" placeholder="Nome da pauta prevista" value={formPrev.titulo} onChange={e=>setFormPrev({...formPrev,titulo:e.target.value})} style={inp}/></div>
                  <div style={{ marginBottom:16 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Descrição</label><textarea placeholder="Detalhes sobre a previsão..." value={formPrev.descricao} onChange={e=>setFormPrev({...formPrev,descricao:e.target.value})} rows={4} style={{...inp,resize:'vertical',lineHeight:1.6}}/></div>
                </>)}
                {aba==='pedidos'&&(<>
                  <div style={{ marginBottom:12 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Data</label><input type="date" value={formPedido.data} onChange={e=>setFormPedido({...formPedido,data:e.target.value})} style={{...inp,colorScheme:'dark'}}/></div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Quem pediu</label><input type="text" placeholder="Seu nome" value={formPedido.quem} onChange={e=>setFormPedido({...formPedido,quem:e.target.value})} style={inp}/></div>
                    <div><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Repórter sugerido</label><input type="text" placeholder="Opcional" value={formPedido.reporter} onChange={e=>setFormPedido({...formPedido,reporter:e.target.value})} style={inp}/></div>
                  </div>
                  <div style={{ marginBottom:12 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Local / Cidade</label><input type="text" placeholder="Ex: Maracanã, Rio de Janeiro" value={formPedido.local} onChange={e=>setFormPedido({...formPedido,local:e.target.value})} style={inp}/></div>
                  <div style={{ marginBottom:16 }}><label style={{ fontSize:11, color:SUBTEXTO, fontWeight:700, textTransform:'uppercase' }}>Descrição do pedido</label><textarea placeholder="Descreva o pedido de pauta..." value={formPedido.descricao} onChange={e=>setFormPedido({...formPedido,descricao:e.target.value})} rows={4} style={{...inp,resize:'vertical',lineHeight:1.6}}/></div>
                </>)}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={aba==='pautas'?salvarPauta:aba==='relatorios'?salvarRelatorio:aba==='previsoes'?salvarPrevisao:salvarPedido} disabled={uploadando} style={{ background:corAba, color:aba==='pedidos'?'#fff':'#000', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:700, fontSize:14 }}>{(editandoPauta||editandoRel||editandoPrev||editandoPedido)?'Salvar edição':'Adicionar'}</button>
                  <button onClick={cancelar} style={{ background:'transparent', border:`1px solid ${BORDA}`, borderRadius:8, padding:'10px 20px', cursor:'pointer', color:SUBTEXTO, fontSize:14 }}>Cancelar</button>
                </div>
              </div>
            )}

            {hasSidebar && dataSelecionada && !mostrarForm && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:4, height:20, background:corAba, borderRadius:2 }}/>
                  <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:SUBTEXTO, textTransform:'uppercase', letterSpacing:0.8 }}>{formatarData(dataSelecionada)}</h3>
                </div>
                <button onClick={() => { setMostrarForm(true); if(aba==='pautas')setFormPauta({...VAZIO_PAUTA,data:dataSelecionada}); else if(aba==='relatorios')setFormRel({...VAZIO_RELATORIO,data:dataSelecionada}); else if(aba==='previsoes')setFormPrev({...VAZIO_PREVISAO,data:dataSelecionada}); else setFormPedido({...VAZIO_PEDIDO,data:dataSelecionada}) }} style={{ background:corAba, color:aba==='pedidos'?'#fff':'#000', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontWeight:700, fontSize:13 }}>
                  + {aba==='pautas'?'Nova pauta':aba==='relatorios'?'Novo relatório':aba==='previsoes'?'Nova previsão':'Novo pedido'}
                </button>
              </div>
            )}

            {hasSidebar && dataSelecionada && !mostrarForm && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {itensDoDia.length===0&&<p style={{ color:SUBTEXTO, fontSize:14 }}>Nenhum registro para este dia.</p>}
                {aba==='pautas'&&itensDoDia.map(p=><CardPauta key={p.id} p={p}/>)}
                {aba==='relatorios'&&itensDoDia.map(r=>(
                  <div key={r.id} style={{ background:CARD, border:`1px solid ${BORDA}`, borderRadius:12, padding:'1rem 1.2rem' }} onMouseEnter={e=>e.currentTarget.style.borderColor=AMARELO} onMouseLeave={e=>e.currentTarget.style.borderColor=BORDA}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <p style={{ margin:0, fontSize:13, color:SUBTEXTO }}>👤 {r.reporter}</p>
                      <div style={{ display:'flex', gap:12 }}>
                        <button onClick={()=>editarRelatorio(r)} style={{ background:'none', border:'none', color:AMARELO, cursor:'pointer', fontSize:13, fontWeight:600 }}>Editar</button>
                        <button onClick={()=>deletarRelatorio(r.id)} style={{ background:'none', border:'none', color:'#ff4444', cursor:'pointer', fontSize:13, fontWeight:600 }}>Deletar</button>
                      </div>
                    </div>
                    <p style={{ margin:'8px 0 0', fontSize:14, color:'#ccc', whiteSpace:'pre-wrap', lineHeight:1.6 }}>{r.texto}</p>
                  </div>
                ))}
                {aba==='previsoes'&&itensDoDia.map(p=>(
                  <div key={p.id} style={{ background:CARD, border:`1px solid ${BORDA}`, borderRadius:12, padding:'1rem 1.2rem' }} onMouseEnter={e=>e.currentTarget.style.borderColor=AMARELO} onMouseLeave={e=>e.currentTarget.style.borderColor=BORDA}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <div><p style={{ margin:0, fontWeight:700, fontSize:15 }}>{p.titulo}</p><PeriodoTag item={p}/></div>
                      <div style={{ display:'flex', gap:12 }}>
                        <button onClick={()=>editarPrevisao(p)} style={{ background:'none', border:'none', color:AMARELO, cursor:'pointer', fontSize:13, fontWeight:600 }}>Editar</button>
                        <button onClick={()=>deletarPrevisao(p.id)} style={{ background:'none', border:'none', color:'#ff4444', cursor:'pointer', fontSize:13, fontWeight:600 }}>Deletar</button>
                      </div>
                    </div>
                    {p.descricao&&<><button onClick={()=>setExpandido(expandido===p.id?null:p.id)} style={{ background:'none', border:'none', color:SUBTEXTO, cursor:'pointer', fontSize:12, padding:0, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginTop:8 }}>{expandido===p.id?'▲ Ocultar':'▼ Ver descrição'}</button>{expandido===p.id&&<p style={{ marginTop:10, fontSize:14, color:'#ccc', whiteSpace:'pre-wrap', background:'#222', borderRadius:8, padding:'12px 14px', lineHeight:1.7, borderLeft:`3px solid ${AMARELO}` }}>{p.descricao}</p>}</>}
                  </div>
                ))}
                {aba==='pedidos'&&itensDoDia.map(p=>(
                  <div key={p.id} style={{ background:CARD, border:`1px solid ${LARANJA}`, borderRadius:12, padding:'1rem 1.2rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ flex:1 }}>
                        <span style={{ display:'inline-block', background:'#2A1A00', color:LARANJA, border:`0.5px solid ${LARANJA}`, borderRadius:20, padding:'2px 10px', fontSize:10, fontWeight:700, marginBottom:8 }}>⏳ Aguardando aprovação</span>
                        <p style={{ margin:0, fontWeight:700, fontSize:15 }}>{p.descricao}</p>
                        <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:3 }}>
                          <p style={{ margin:0, fontSize:13, color:SUBTEXTO }}>👤 Pedido por: {p.quem}</p>
                          {p.reporter&&<p style={{ margin:0, fontSize:13, color:SUBTEXTO }}>🎙️ Repórter sugerido: {p.reporter}</p>}
                          {p.local&&<p style={{ margin:0, fontSize:13, color:SUBTEXTO }}>📍 {p.local}</p>}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:10, marginLeft:12, flexShrink:0 }}>
                        <button onClick={()=>editarPedido(p)} style={{ background:'none', border:'none', color:LARANJA, cursor:'pointer', fontSize:13, fontWeight:600 }}>Editar</button>
                        <button onClick={()=>deletarPedido(p.id)} style={{ background:'none', border:'none', color:'#ff4444', cursor:'pointer', fontSize:13, fontWeight:600 }}>Deletar</button>
                      </div>
                    </div>
                    <button onClick={()=>converterEmPauta(p)} style={{ marginTop:12, background:AMARELO, color:'#000', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontWeight:700, fontSize:13 }}>✅ Converter em pauta</button>
                  </div>
                ))}
              </div>
            )}

            {hasSidebar && !dataSelecionada && !mostrarForm && <EmptyState />}

          </section>
        )}
      </div>
    </main>
  )
}
