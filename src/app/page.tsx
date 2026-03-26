'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(s => {
        if (s.role === 'admin') router.replace('/admin')
        else if (s.role === 'group' && s.groupId) router.replace(`/grupo/${s.groupId}`)
        else router.replace('/login')
      })
      .catch(() => router.replace('/login'))
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
    </div>
  )
}
