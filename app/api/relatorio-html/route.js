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
function badges(conteudo = '', titulo = '') {
  const txt = (conteudo + titulo).toLowerCase()
  let b = ''
  if (txt.includes('ao vivo') || txt.includes('link ao vivo') || txt.includes('entrada ao vivo')) b += badge('Ao vivo', '#e53935')
  if (txt.includes('redes') || txt.includes('instagram') || txt.includes('youtube')) b += badge('Redes', '#1a7a4a')
  if (txt.includes('boletim')) b += badge('Boletim', '#f9a825')
  if (txt.includes(' vt ') || txt.includes('transmissão') || txt.includes('transmissao')) b += badge('VT', '#5c35cc')
  return b
}
function icone(titulo = '') {
  const t = titulo.toLowerCase()
  if (t.includes('entrevista')) return '🎙'
  if (t.includes('treino')) return '⚽'
  if (t.includes('viagem') || t.includes('retorno')) return '✈️'
  if (t.includes('externa') || t.includes('cobertura')) return '📡'
  if (t.includes('basquete') || t.includes('nbb')) return '🏀'
  if (t.includes('tênis') || t.includes('open')) return '🎾'
  return '📋'
}
function cardHoje(p) {
  const local = p.conteudo?.match(/📍([^\n]+)/)?.[1]?.trim() || ''
  const horario = p.conteudo?.match(/⏰([^\n]+)/)?.[1]?.trim() || ''
  const resumo = [p.reporter, local, horario].filter(Boolean).join(' · ')
  return `<div style="border-left:3px solid #ccc;padding:8px 14px;margin-bottom:8px;background:#fafafa;border-radius:0 6px 6px 0;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
      <strong style="font-size:13px;color:#111;">${icone(p.titulo)} ${p.titulo}</strong>
      <div style="flex-shrink:0;">${badges(p.conteudo, p.titulo)}</div>
    </div>
    <span style="font-size:12px;color:#555;">${resumo}</span>
  </div>`
}
function cardAmanha(p) {
  const local = p.conteudo?.match(/📍([^\n]+)/)?.[1]?.trim() || ''
  const horario = p.conteudo?.match(/⏰([^\n]+)/)?.[1]?.trim() || ''
  const resumo = [p.reporter, local, horario].filter(Boolean).join(' · ')
  return `<div style="border-left:3px dashed #bbb;padding:8px 14px;margin-bottom:8px;background:#fafafa;border-radius:0 6px 6px 0;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
      <strong style="font-size:13px;color:#111;">${p.titulo}</strong>
      <div style="flex-shrink:0;">${badges(p.conteudo, p.titulo)}</div>
    </div>
    <span style="font-size:12px;color:#555;">${resumo}</span>
  </div>`
}

export async function GET(req) {
  try {
    const host = req.headers.get('host')
    const proto = host?.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${proto}://${host}`

    const [pautas, relatorios] = await Promise.all([
      fetch(`${baseUrl}/api/pautas`).then(r => r.json()),
      fetch(`${baseUrl}/api/relatorios`).then(r => r.json()),
    ])

    const hoje = new Date().toISOString().split('T')[0]
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    const pautasHoje = pautas.filter(p => getDatasNoPeriodo(p.data, p.dataFim).includes(hoje))
    const relHoje = relatorios.filter(r => r.data === hoje)
    const pautasAmanha = pautas.filter(p => getDatasNoPeriodo(p.data, p.dataFim).includes(amanha))

    const diaHoje = fmtCurta(hoje).toUpperCase()
    const diaAmanha = fmtCurta(amanha).toUpperCase()
    const dataHoje = fmtData(hoje)

    const secaoHoje = pautasHoje.length > 0
      ? pautasHoje.map(cardHoje).join('')
      : '<p style="font-size:13px;color:#aaa;font-style:italic;">Nenhuma pauta para hoje.</p>'

    const secaoRelatorios = relHoje.length > 0 ? `
      <hr style="border:none;border-top:1px solid #eee;margin:14px 0"/>
      <p style="font-size:10px;font-weight:700;color:#888;letter-spacing:1px;margin:0 0 8px;text-transform:uppercase;">RELATÓRIOS DO DIA</p>
      ${relHoje.map(r => `<div style="border-left:3px solid #e8e8e8;padding:8px 14px;margin-bottom:8px;background:#fafafa;border-radius:0 6px 6px 0;">
        <strong style="font-size:12px;color:#555;">📝 ${r.reporter}</strong><br/>
        <span style="font-size:12px;color:#777;">${(r.texto||'').slice(0,200)}${(r.texto||'').length > 200 ? '...' : ''}</span>
      </div>`).join('')}` : ''

    const secaoAmanha = pautasAmanha.length > 0
      ? pautasAmanha.map(cardAmanha).join('')
      : '<p style="font-size:13px;color:#aaa;font-style:italic;">Nenhuma pauta para amanhã.</p>'

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Pautas CazéTV — ${dataHoje}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px 40px; max-width: 680px; margin: 0 auto; }
    @media print { .no-print { display: none !important; } body { padding: 0; } @page { margin: 20mm; } }
  </style>
</head>
<body>
  <div class="no-print" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:8px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-weight:700;font-size:14px;">📋 Relatório gerado — revise e imprima como PDF</span>
    <button onclick="window.print()" style="background:#FFD600;color:#000;border:none;border-radius:8px;padding:8px 20px;cursor:pointer;font-weight:700;font-size:13px;">⬇️ Salvar como PDF</button>
  </div>

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
  ${secaoHoje}
  ${secaoRelatorios}

  <hr style="border:none;border-top:1px solid #eee;margin:14px 0"/>
  <p style="font-size:10px;font-weight:700;color:#888;letter-spacing:1px;margin:0 0 8px;text-transform:uppercase;">PREVISÃO — ${diaAmanha}</p>
  ${secaoAmanha}

  <hr style="border:none;border-top:1px solid #eee;margin:14px 0"/>
  <p style="font-size:11px;color:#aaa;margin:0;">${pautasAmanha.length} cobertura(s) prevista(s)</p>
</body>
</html>`

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch (err) {
    return new Response(`<h2>Erro: ${err.message}</h2>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}
