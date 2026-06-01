import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const hazard = await prisma.hazard.findUnique({
    where: { id: params.id },
  })

  if (!hazard) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(hazard)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json()

  const hazard = await prisma.hazard.update({
    where: { id: params.id },
    data: {
      ...body,
      ...(body.occurredAt && { occurredAt: new Date(body.occurredAt) }),
      ...(body.resolvedAt && { resolvedAt: new Date(body.resolvedAt) }),
    },
  })

  return NextResponse.json(hazard)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.hazard.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
