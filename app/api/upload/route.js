import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const form = await req.formData()
  const file = form.get('file')
  if (!file) return NextResponse.json({ error: 'Nenhum arquivo' }, { status: 400 })

  const blob = await put(file.name, file, { access: 'public' })
  return NextResponse.json({ url: blob.url })
}
