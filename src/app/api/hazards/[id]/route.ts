import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { UpdateHazardSchema } from '@/lib/schemas'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const hazard = await prisma.hazard.findUnique({ where: { id: params.id } })
    if (!hazard) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(hazard)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // updatedAt は楽観的ロック用に個別取り出し（バリデーション対象外）
  const { updatedAt, ...rest } = body as Record<string, unknown>

  const parsed = UpdateHazardSchema.safeParse(rest)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const data = parsed.data

  // 楽観的ロック: updatedAt が送られた場合のみ競合チェック
  if (updatedAt) {
    try {
      const current = await prisma.hazard.findUnique({ where: { id: params.id } })
      if (!current) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      if (current.updatedAt.getTime() !== new Date(updatedAt as string).getTime()) {
        return NextResponse.json({ error: 'conflict', current }, { status: 409 })
      }
    } catch {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  try {
    const hazard = await prisma.hazard.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.occurredAt && { occurredAt: new Date(data.occurredAt) }),
        ...(data.resolvedAt !== undefined && {
          resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : null,
        }),
      },
    })
    return NextResponse.json(hazard)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await prisma.hazard.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
