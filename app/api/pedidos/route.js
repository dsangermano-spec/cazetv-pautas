import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()
const KEY = 'pedidos'

export async function GET() {
  const pedidos = await redis.get(KEY) || []
  return NextResponse.json(pedidos)
}

export async function POST(req) {
  const body = await req.json()
  const pedidos = await redis.get(KEY) || []
  const novo = { ...body, id: Date.now().toString() }
  await redis.set(KEY, [...pedidos, novo])
  return NextResponse.json(novo)
}

export async function PUT(req) {
  const body = await req.json()
  const pedidos = await redis.get(KEY) || []
  const atualizados = pedidos.map(p => p.id === body.id ? body : p)
  await redis.set(KEY, atualizados)
  return NextResponse.json(body)
}

export async function DELETE(req) {
  const { id } = await req.json()
  const pedidos = await redis.get(KEY) || []
  await redis.set(KEY, pedidos.filter(p => p.id !== id))
  return NextResponse.json({ ok: true })
}
