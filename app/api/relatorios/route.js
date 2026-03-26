import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()
const KEY = 'relatorios'

export async function GET() {
  const relatorios = await redis.get(KEY) || []
  return NextResponse.json(relatorios)
}

export async function POST(req) {
  const body = await req.json()
  const relatorios = await redis.get(KEY) || []
  const novo = { ...body, id: Date.now().toString() }
  await redis.set(KEY, [...relatorios, novo])
  return NextResponse.json(novo)
}

export async function PUT(req) {
  const body = await req.json()
  const relatorios = await redis.get(KEY) || []
  const atualizados = relatorios.map(r => r.id === body.id ? body : r)
  await redis.set(KEY, atualizados)
  return NextResponse.json(body)
}

export async function DELETE(req) {
  const { id } = await req.json()
  const relatorios = await redis.get(KEY) || []
  await redis.set(KEY, relatorios.filter(r => r.id !== id))
  return NextResponse.json({ ok: true })
}
