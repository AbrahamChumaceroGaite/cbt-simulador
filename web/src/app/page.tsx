'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    authService.me()
      .then(s => {
        if (s.role === 'admin') router.replace('/admin')
        else if (s.role === 'group' && s.groupId) router.replace(`/grupo/${s.groupId}`)
        else router.replace('/login')
      })
      .catch(() => router.replace('/login'))
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex flex-col items-center justify-center gap-3">
      <div className="w-full max-w-sm space-y-3">
        <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-800" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-800" />
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-zinc-800" />
      </div>
    </div>
  )
}
