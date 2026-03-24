import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/utils'

export async function GET() {
  const groups = await prisma.group.findMany({
    include: { _count: { select: { simulations: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(groups)
}

export async function POST(req: Request) {
  const { name, course, plant } = await req.json()
  if (!name || !course || !plant)
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  let code = generateCode()
  // Ensure unique
  while (await prisma.group.findUnique({ where: { code } })) code = generateCode()

  const group = await prisma.group.create({
    data: { name, course, plant, code },
  })
  return NextResponse.json(group, { status: 201 })
}
