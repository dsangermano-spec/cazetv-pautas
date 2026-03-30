import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()
const KEY = 'metricas'

export async function GET() {
  const metricas = await redis.get(KEY) || []
  return NextResponse.json(metricas)
}

export async function POST(req) {
  const body = await req.json()
  const metricas = await redis.get(KEY) || []
  const nova = { ...body, id: Date.now().toString() }
  await redis.set(KEY, [...metricas, nova])
  return NextResponse.json(nova)
}

export async function PUT(req) {
  const body = await req.json()
  const metricas = await redis.get(KEY) || []
  const atualizadas = metricas.map(m => m.id === body.id ? body : m)
  await redis.set(KEY, atualizadas)
  return NextResponse.json(body)
}

export async function DELETE(req) {
  const { id } = await req.json()
  const metricas = await redis.get(KEY) || []
  await redis.set(KEY, metricas.filter(m => m.id !== id))
  return NextResponse.json({ ok: true })
}
