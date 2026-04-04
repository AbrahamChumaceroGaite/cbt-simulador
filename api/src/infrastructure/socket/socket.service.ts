import { Injectable, Logger } from '@nestjs/common'
import { WebSocket }          from 'ws'
import { WS_EVENTS }          from './socket.events'

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name)

  // adminId  → connected sockets (multiple tabs)
  private readonly admins  = new Map<string, Set<WebSocket>>()
  // groupId  → connected sockets
  private readonly groups  = new Map<string, Set<WebSocket>>()
  // socket   → { map, id } for O(1) cleanup
  private readonly meta    = new Map<WebSocket, { map: Map<string, Set<WebSocket>>; id: string }>()

  register(role: 'admin' | 'group', id: string, client: WebSocket): void {
    const map = role === 'admin' ? this.admins : this.groups
    if (!map.has(id)) map.set(id, new Set())
    map.get(id)!.add(client)
    this.meta.set(client, { map, id })
    this.logger.log(`[register] ${role} id=${id} — total ${role}s: ${map.size}`)
  }

  unregister(client: WebSocket): void {
    const entry = this.meta.get(client)
    if (!entry) return
    const { map, id } = entry
    map.get(id)?.delete(client)
    if (map.get(id)?.size === 0) map.delete(id)
    this.meta.delete(client)
  }

  // Fired when a group records a new entry — admins + the group itself receive it
  entrySaved(payload: { simulationId: string; groupId: string; sessionNum: number; realHeight: number | null }): void {
    this.toAll(this.admins, WS_EVENTS.ENTRY_SAVED, payload)
    this.toOne(this.groups, payload.groupId, WS_EVENTS.ENTRY_SAVED, payload)
  }

  // Fired when admin updates simulation settings (e.g., isLocked) — the affected group receives it
  simulationUpdated(groupId: string, payload: { simulationId: string; isLocked?: boolean }): void {
    this.toAll(this.admins, WS_EVENTS.SIMULATION_UPDATED, payload)
    this.toOne(this.groups, groupId, WS_EVENTS.SIMULATION_UPDATED, payload)
  }

  private send(client: WebSocket, event: string, data: unknown): void {
    if (client.readyState !== WebSocket.OPEN) return
    client.send(JSON.stringify({ event, data }))
  }

  private toAll(map: Map<string, Set<WebSocket>>, event: string, data: unknown): void {
    for (const sockets of map.values())
      for (const s of sockets) this.send(s, event, data)
  }

  private toOne(map: Map<string, Set<WebSocket>>, id: string, event: string, data: unknown): void {
    const sockets = map.get(id)
    if (!sockets) return
    for (const s of sockets) this.send(s, event, data)
  }
}
