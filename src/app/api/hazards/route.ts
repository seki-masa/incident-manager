import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateHazardInput } from '@/types/hazard'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const minLevel = searchParams.get('minLevel')
  const maxLevel = searchParams.get('maxLevel')

  const hazards = await prisma.hazard.findMany({
    where: {
      ...(type && { type }),
      ...(status && { status }),
      dangerLevel: {
        gte: minLevel ? Number(minLevel) : undefined,
        lte: maxLevel ? Number(maxLevel) : undefined,
      },
    },
    orderBy: { occurredAt: 'desc' },
  })

  return NextResponse.json(hazards)
}

export async function POST(req: NextRequest) {
  const body: CreateHazardInput = await req.json()

  const hazard = await prisma.hazard.create({
    data: {
      type: body.type,
      title: body.title,
      description: body.description,
      lat: body.lat,
      lng: body.lng,
      prefecture: body.prefecture,
      dangerLevel: body.dangerLevel,
      status: body.status ?? 'active',
      occurredAt: new Date(body.occurredAt),
    },
  })

  return NextResponse.json(hazard, { status: 201 })
}
