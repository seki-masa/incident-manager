import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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
  const { updatedAt, ...data } = body

  // 楽観的ロック: updatedAt が送られた場合のみ競合チェック
  if (updatedAt) {
    const current = await prisma.hazard.findUnique({ where: { id: params.id } })
    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (current.updatedAt.getTime() !== new Date(updatedAt).getTime()) {
      return NextResponse.json({ error: 'conflict', current }, { status: 409 })
    }
  }

  try {
    const hazard = await prisma.hazard.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.occurredAt && { occurredAt: new Date(data.occurredAt) }),
        ...(data.resolvedAt && { resolvedAt: new Date(data.resolvedAt) }),
      },
    })
    return NextResponse.json(hazard)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw err
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.hazard.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
