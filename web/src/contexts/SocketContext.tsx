'use client'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { WsEvent, WsPayloads } from '@/ws/events'

type Handler<E extends WsEvent> = (data: WsPayloads[E]) => void
type AnyHandler = (data: unknown) => void

interface WsContextValue {
  on: <E extends WsEvent>(event: E, handler: Handler<E>) => () => void
}

const WsContext = createContext<WsContextValue | null>(null)

export function useWs() {
  const ctx = useContext(WsContext)
  if (!ctx) throw new Error('useWs must be used inside SocketProvider')
  return ctx
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef<Map<string, Set<AnyHandler>>>(new Map())
  const wsRef     = useRef<WebSocket | null>(null)
  const deadRef   = useRef(false)

  useEffect(() => {
    function connect() {
      if (deadRef.current) return
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const url   = `${proto}//${window.location.host}/ws`
      console.log('[ws] connecting →', url)
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen  = ()  => console.log('[ws] connected')
      ws.onerror = (e) => console.error('[ws] error', e)
      ws.onclose = (e) => {
        console.log(`[ws] closed code=${e.code} reason=${e.reason}`)
        if (!deadRef.current) setTimeout(connect, 3000)
      }
      ws.onmessage = (e) => {
        try {
          const { event, data } = JSON.parse(e.data)
          const handlers = listeners.current.get(event)
          if (handlers) Array.from(handlers).forEach(h => h(data))
        } catch { /* ignore malformed frames */ }
      }
    }

    connect()

    return () => {
      deadRef.current = true
      wsRef.current?.close()
    }
  }, [])

  const ctx: WsContextValue = {
    on: (event, handler) => {
      const h = handler as AnyHandler
      if (!listeners.current.has(event)) listeners.current.set(event, new Set())
      listeners.current.get(event)!.add(h)
      return () => { listeners.current.get(event)?.delete(h) }
    },
  }

  return <WsContext.Provider value={ctx}>{children}</WsContext.Provider>
}
