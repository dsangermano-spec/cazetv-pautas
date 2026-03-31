export async function POST(req) {
  try {
    const { prompt } = await req.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const html = data.content?.find(b => b.type === 'text')?.text || '<p>Erro ao gerar relatório.</p>'
    return Response.json({ html })
  } catch (err) {
    return Response.json({ html: '<p style="color:red">Erro no servidor. Tente novamente.</p>' }, { status: 500 })
  }
}
