import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()

function fmtLonga(str: string) {
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
}
function fmtCurta(str: string) {
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  })
}
function getDatasNoPeriodo(dataInicio: string, dataFim: string) {
  const datas: string[] = []
  const d = new Date(dataInicio + 'T12:00:00')
  const fim = new Date((dataFim || dataInicio) + 'T12:00:00')
  while (d <= fim) { datas.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1) }
  return datas
}

export async function GET() {
  try {
    const [pautas, relatorios]: [any[], any[]] = await Promise.all([
      redis.get('pautas').then((r: any) => r || []),
      redis.get('relatorios').then((r: any) => r || []),
    ])

    const hoje = new Date().toISOString().split('T')[0]
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    const relHoje = relatorios.filter((r: any) => r.data === hoje)
    const pautasAmanha = pautas.filter((p: any) =>
      getDatasNoPeriodo(p.data, p.dataFim || p.data).includes(amanha)
    )

    const dataHojeLabel = fmtLonga(hoje)
    const dataAmanhaLabel = fmtCurta(amanha)

    const secaoRelatorios = relHoje.length > 0
      ? relHoje.map((r: any) => `
        <div style="border-left:4px solid #FFD600;padding:12px 16px;margin-bottom:12px;background:#fffef0;border-radius:0 8px 8px 0;">
          <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:4px;">📝 ${r.reporter}</div>
          <div style="font-size:14px;color:#111;line-height:1.6;white-space:pre-wrap;">${r.texto || ''}</div>
        </div>`).join('')
      : '<p style="font-size:13px;color:#aaa;font-style:italic;">Nenhum relatório registrado hoje.</p>'

    const secaoPautas = pautasAmanha.length > 0
      ? pautasAmanha.map((p: any) => `
        <div style="border-left:4px solid #111;padding:12px 16px;margin-bottom:10px;background:#f9f9f9;border-radius:0 8px 8px 0;">
          <div style="font-size:14px;font-weight:700;color:#111;">📋 ${p.titulo}</div>
          <div style="font-size:12px;color:#555;margin-top:3px;">👤 ${p.reporter}</div>
        </div>`).join('')
      : '<p style="font-size:13px;color:#aaa;font-style:italic;">Nenhuma pauta prevista para amanhã.</p>'

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Relatório CazéTV — ${dataHojeLabel}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #111; margin: 0; padding: 32px 40px; max-width: 680px; margin: 0 auto; }
    @media print { .no-print { display: none !important; } body { padding: 0; } @page { margin: 20mm; } }
  </style>
</head>
<body>

  <div class="no-print" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-weight:700;font-size:13px;">📋 Revise e salve como PDF ou copie para e-mail</span>
    <button onclick="window.print()" style="background:#FFD600;color:#000;border:none;border-radius:8px;padding:8px 18px;cursor:pointer;font-weight:700;font-size:13px;">⬇️ Salvar PDF</button>
  </div>

  <!-- CABEÇALHO -->
  <div style="border-bottom:4px solid #FFD600;padding-bottom:16px;margin-bottom:24px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <span style="background:#FFD600;color:#000;font-weight:900;font-size:18px;padding:6px 12px;border-radius:6px;letter-spacing:-0.5px;">CazéTV</span>
      <span style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Relatório Diário</span>
    </div>
    <div style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">${dataHojeLabel}</div>
  </div>

  <!-- RELATÓRIOS DE HOJE -->
  <div style="margin-bottom:28px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
      <div style="width:4px;height:18px;background:#FFD600;border-radius:2px;"></div>
      <h2 style="margin:0;font-size:13px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:1px;">Relatórios de hoje</h2>
    </div>
    ${secaoRelatorios}
  </div>

  <!-- PAUTAS DE AMANHÃ -->
  <div style="margin-bottom:28px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
      <div style="width:4px;height:18px;background:#111;border-radius:2px;"></div>
      <h2 style="margin:0;font-size:13px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:1px;">Pautas de amanhã — ${dataAmanhaLabel}</h2>
    </div>
    ${secaoPautas}
  </div>

  <!-- RODAPÉ -->
  <div style="border-top:1px solid #eee;padding-top:14px;margin-top:8px;">
    <p style="font-size:11px;color:#bbb;margin:0;">
      Gerado em ${new Date().toLocaleString('pt-BR')} · CazéTV Pautas
    </p>
  </div>

</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
