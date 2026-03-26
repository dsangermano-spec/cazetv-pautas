import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()
const KEY = 'pautas'

export async function GET() {
  const pautas = await redis.get(KEY) || []
  return NextResponse.json(pautas)
}

export async function POST(req) {
  const body = await req.json()
  const pautas = await redis.get(KEY) || []
  const nova = { ...body, id: Date.now().toString() }
  await redis.set(KEY, [...pautas, nova])
  return NextResponse.json(nova)
}

export async function PUT(req) {
  const body = await req.json()
  const pautas = await redis.get(KEY) || []
  const atualizadas = pautas.map(p => p.id === body.id ? body : p)
  await redis.set(KEY, atualizadas)
  return NextResponse.json(body)
}

export async function DELETE(req) {
  const { id } = await req.json()
  const pautas = await redis.get(KEY) || []
  await redis.set(KEY, pautas.filter(p => p.id !== id))
  return NextResponse.json({ ok: true })
}
