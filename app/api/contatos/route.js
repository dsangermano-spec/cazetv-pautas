import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()
const KEY = 'contatos'

export async function GET() {
  const contatos = await redis.get(KEY) || []
  return NextResponse.json(contatos)
}

export async function POST(req) {
  const body = await req.json()
  const contatos = await redis.get(KEY) || []
  const novo = { ...body, id: Date.now().toString() }
  await redis.set(KEY, [...contatos, novo])
  return NextResponse.json(novo)
}

export async function PUT(req) {
  const body = await req.json()
  const contatos = await redis.get(KEY) || []
  const atualizados = contatos.map(c => c.id === body.id ? body : c)
  await redis.set(KEY, atualizados)
  return NextResponse.json(body)
}

export async function DELETE(req) {
  const { id } = await req.json()
  const contatos = await redis.get(KEY) || []
  await redis.set(KEY, contatos.filter(c => c.id !== id))
  return NextResponse.json({ ok: true })
}
