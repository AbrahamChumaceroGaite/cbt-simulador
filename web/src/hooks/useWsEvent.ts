import { useEffect }                    from 'react'
import { useWs }                        from '@/contexts/SocketContext'
import type { WsEvent, WsPayloads }     from '@/ws/events'

export function useWsEvent<E extends WsEvent>(
  event: E,
  handler: (data: WsPayloads[E]) => void,
  deps: unknown[] = [],
): void {
  const ws = useWs()

  useEffect(() => {
    return ws.on(event, handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps])
}
