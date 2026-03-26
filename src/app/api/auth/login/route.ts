import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { code, password, mode } = await req.json()
    if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

    const normalizedCode = String(code).trim().toUpperCase()

    if (mode === 'admin') {
      // Admin login
      const user = await prisma.user.findUnique({ where: { code: normalizedCode.toLowerCase() } })
      if (!user || !user.isActive || user.role !== 'admin') {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
      }
      if (!password) return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 })
      const valid = await bcrypt.compare(String(password), user.passwordHash)
      if (!valid) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

      const token = await signToken({ userId: user.id, role: 'admin', code: user.code, fullName: user.fullName })
      const res = NextResponse.json({ role: 'admin', fullName: user.fullName })
      res.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 8 * 60 * 60, path: '/' })
      return res
    }

    // Group login — code is the sole credential
    const group = await prisma.group.findUnique({ where: { code: normalizedCode } })
    if (!group) return NextResponse.json({ error: 'Código de grupo no encontrado' }, { status: 401 })

    const token = await signToken({ userId: group.id, role: 'group', groupId: group.id, code: group.code, fullName: group.name })
    const res = NextResponse.json({ role: 'group', groupId: group.id, fullName: group.name })
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 8 * 60 * 60, path: '/' })
    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
