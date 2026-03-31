function fmtData(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
}
function fmtCurta(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}
function getDatasNoPeriodo(dataInicio, dataFim) {
  const datas = []
  const d = new Date(dataInicio + 'T12:00:00')
  const fim = new Date((dataFim || dataInicio) + 'T12:00:00')
  while (d <= fim) { datas.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1) }
  return datas
}
function badge(texto, cor) {
  return `<span style="background:${cor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;margin-left:4px;">${texto}</span>`
}
function badgesParaPauta(conteudo = '', titulo = '') {
  const txt = (conteudo + titulo).toLowerCase()
  let b = ''
  if (txt.includes('ao vivo') || txt.includes('link ao vivo') || txt.includes('entrada ao vivo')) b += badge('Ao vivo', '#e53935')
  if (txt.includes('redes') || txt.includes('instagram') || txt.includes('youtube')) b += badge('Redes', '#1a7a4a')
  if (txt.includes('boletim')) b += badge('Boletim', '#f9a825')
  if (txt.includes(' vt ') || txt.includes('transmissão') || txt.includes('transmissao')) b += badge('VT', '#5c35cc')
  return b
}
function iconeParaPauta(titulo = '') {
  const t = titulo.toLowerCase()
  if (t.includes('entrevista')) return '🎙'
  if (t.includes('treino')) return '⚽'
  if (t.includes('viagem') || t.includes('retorno') || t.includes('voo')) return '✈️'
  if (t.includes('cobertura') || t.includes('externa')) return '📡'
  if (t.includes('basquete') || t.includes('nbb')) return '🏀'
  if (t.includes('tênis') || t.includes('open')) return '🎾'
  return '📋'
}
function cardHoje(p) {
  const local = p.conteudo?.match(/📍([^\n]+)/)?.[1]?.trim() || ''
  const horario = p.conteudo?.match(/⏰([^\n]+)/)?.[1]?.trim() || ''
  const resumo = [p.reporter, local, horario].filter(Boolean).join(' · ')
  return `<div style="border-left:3px solid #ccc;padding:8px 12px;margin-bottom:8px;background:#fafafa;border-radius:0 6px 6px 0;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
    <strong style="font-size:13px;color:#111;">${iconeParaPauta(p.titulo)} ${p.titulo}</strong>
    <div style="flex-shrink:0;">${badgesParaPauta(p.conteudo, p.titulo)}</div>
  </div>
  <span style="font-size:12px;color:#555;">${resumo}</span>
</div>`
}
function cardAmanha(p) {
  const local = p.conteudo?.match(/📍([^\n]+)/)?.[1]?.trim() || ''
  const horario = p.conteudo?.match(/⏰([^\n]+)/)?.[1]?.trim() || ''
  const resumo = [p.reporter, local, horario].filter(Boolean).join(' · ')
  return `<div style="border-left:3px dashed #ccc;padding:8px 12px;margin-bottom:8px;background:#fafafa;border-radius:0 6px 6px 0;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
    <strong style="font-size:13px;color:#111;">${p.titulo}</strong>
    <div style="flex-shrink:0;">${badgesParaPauta(p.conteudo, p.titulo)}</div>
  </div>
  <span style="font-size:12px;color:#555;">${resumo}</span>
</div>`
}

export async function GET(req) {
  return await gerarHTML()
}

export async function POST(req) {
  return await gerarHTML()
}

async function gerarHTML() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const [resPautas, resRelatorios] = await Promise.all([
      fetch(`${baseUrl}/api/pautas`).then(r => r.json()),
      fetch(`${baseUrl}/api/relatorios`).then(r => r.json()),
    ])

    const hoje = new Date().toISOString().split('T')[0]
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    const pautasHoje = resPautas.filter(p => getDatasNoPeriodo(p.data, p.dataFim).includes(hoje))
    const relHoje = resRelatorios.filter(r => r.data === hoje)
    const pautasAmanha = resPautas.filter(p => getDatasNoPeriodo(p.data, p.dataFim).includes(amanha))

    const diaHoje = fmtCurta(hoje).toUpperCase()
    const diaAmanha = fmtCurta(amanha).toUpperCase()
    const dataHoje = fmtData(hoje)

    const cardsHoje = pautasHoje.length > 0
      ? pautasHoje.map(cardHoje).join('')
      : '<p style="font-size:13px;color:#aaa;font-style:italic;">Nenhuma pauta cadastrada para hoje.</p>'

    const cardsRelatorios = relHoje.length > 0 ? `
<hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
<p style="font-size:10px;font-weight:700;color:#888;letter-spacing:1px;margin:0 0 8px;text-transform:uppercase;">RELATÓRIOS DO DIA</p>
${relHoje.map(r => `<div style="border-left:3px solid #e8e8e8;padding:8px 12px;margin-bottom:8px;background:#fafafa;border-radius:0 6px 6px 0;">
  <strong style="font-size:12px;color:#555;">📝 ${r.reporter}</strong><br/>
  <span style="font-size:12px;color:#777;">${(r.texto||'').slice(0,200)}${(r.texto||'').length > 200 ? '...' : ''}</span>
</div>`).join('')}` : ''

    const cardsAmanha = pautasAmanha.length > 0
      ? pautasAmanha.map(cardAmanha).join('')
      : '<p style="font-size:13px;color:#aaa;font-style:italic;">Nenhuma pauta cadastrada para amanhã.</p>'

    const html = `
<p style="font-size:10px;color:#999;margin:0;text-transform:uppercase;letter-spacing:1px;">RELATÓRIO DIÁRIO · ${dataHoje}</p>
<h1 style="font-size:20px;font-weight:800;margin:4px 0 14px;color:#111;">Pautas do dia — CazéTV</h1>
<div style="background:#1a7a4a;color:#fff;padding:10px 16px;border-radius:8px;text-align:center;font-weight:700;font-size:12px;margin-bottom:16px;">
  Ver detalhes completos → cazetv-pautas.vercel.app
</div>
<div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
  <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:#444;"><span style="width:8px;height:8px;border-radius:50%;background:#e53935;display:inline-block;"></span>Ao vivo</span>
  <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:#444;"><span style="width:8px;height:8px;border-radius:50%;background:#1a7a4a;display:inline-block;"></span>Redes</span>
  <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:#444;"><span style="width:8px;height:8px;border-radius:50%;background:#f9a825;display:inline-block;"></span>Boletim</span>
  <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:#444;"><span style="width:8px;height:8px;border-radius:50%;background:#5c35cc;display:inline-block;"></span>VT</span>
</div>
<hr style="border:none;border-top:1px solid #eee;margin:10px 0"/>
<p style="font-size:10px;font-weight:700;color:#888;letter-spacing:1px;margin:0 0 8px;text-transform:uppercase;">HOJE — ${diaHoje}</p>
${cardsHoje}
${cardsRelatorios}
<hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
<p style="font-size:10px;font-weight:700;color:#888;letter-spacing:1px;margin:0 0 8px;text-transform:uppercase;">PREVISÃO — ${diaAmanha}</p>
${cardsAmanha}
<hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
<p style="font-size:11px;color:#aaa;margin:0;">${pautasAmanha.length} cobertura(s) prevista(s)</p>`

    return Response.json({ html })
  } catch (err) {
    return Response.json({ html: `<p style="color:red">Erro ao gerar: ${err.message}</p>` }, { status: 500 })
  }
}
