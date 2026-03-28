import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token   = cookies().get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const groups = await prisma.group.findMany({
      include: {
        members: { orderBy: { name: 'asc' } },
        simulations: {
          include: {
            entries: { orderBy: { sessionNum: 'asc' } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { course: 'asc' },
    })

    const payload = {
      version:    1,
      exportedAt: new Date().toISOString(),
      groups,
    }

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-plantas-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
