import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateHazardSchema, ListFilterSchema } from '@/lib/schemas'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const parsed = ListFilterSchema.safeParse({
    type: searchParams.get('type') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    minLevel: searchParams.get('minLevel') ?? undefined,
    maxLevel: searchParams.get('maxLevel') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid filter parameters' }, { status: 400 })
  }
  const { type, status, minLevel, maxLevel } = parsed.data

  try {
    const hazards = await prisma.hazard.findMany({
      where: {
        ...(type && { type }),
        ...(status && { status }),
        dangerLevel: {
          gte: minLevel,
          lte: maxLevel,
        },
      },
      orderBy: { occurredAt: 'desc' },
    })
    return NextResponse.json(hazards)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateHazardSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const data = parsed.data

  try {
    const hazard = await prisma.hazard.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        lat: data.lat,
        lng: data.lng,
        prefecture: data.prefecture,
        dangerLevel: data.dangerLevel,
        status: data.status,
        occurredAt: new Date(data.occurredAt),
      },
    })
    return NextResponse.json(hazard, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
