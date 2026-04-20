import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import type { SensorReading, MonitoreoResponse }              from '@simulador/shared'
import { PrismaService }    from '../../infrastructure/prisma/prisma.service'
import { SocketService }    from '../../infrastructure/socket/socket.service'

const CHANNEL_ID    = process.env.THINGSPEAK_CHANNEL_ID  ?? '3349007'
const READ_API_KEY  = process.env.THINGSPEAK_READ_API_KEY ?? 'US7HO49ZN128I67G'
const POLL_MS       = 16_000
const MAX_PER_GROUP = 200

function tsUrl(params: Record<string, string>) {
  const q = new URLSearchParams({ api_key: READ_API_KEY, timezone: 'America/La_Paz', ...params })
  return `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?${q}`
}

function parseFeeds(feeds: Array<Record<string, string>>): SensorReading[] {
  const out: SensorReading[] = []
  for (const f of feeds) {
    const group = (f.field1 ?? '').trim()
    const temp  = parseFloat(f.field2 ?? '')
    const hum   = parseFloat(f.field3 ?? '')
    const id    = parseInt(f.entry_id ?? '0', 10)
    if (!group || isNaN(temp) || isNaN(hum)) continue
    out.push({ group, temperature: temp, humidity: hum, timestamp: f.created_at, entryId: id })
  }
  return out
}

@Injectable()
export class MonitoreoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger  = new Logger(MonitoreoService.name)
  private readonly cache   = new Map<string, SensorReading[]>()
  private lastEntryId      = 0
  private lastUpdated: string | null = null
  private intervalRef: ReturnType<typeof setInterval> | null = null

  constructor(
    private readonly prisma:   PrismaService,
    private readonly sockets:  SocketService,
  ) {}

  onModuleInit() {
    this.loadHistory()
      .then(() => { this.intervalRef = setInterval(() => this.poll(), POLL_MS) })
      .catch(err => this.logger.error('loadHistory failed', err))
  }

  onModuleDestroy() {
    if (this.intervalRef) clearInterval(this.intervalRef)
  }

  private addToCache(reading: SensorReading) {
    if (!this.cache.has(reading.group)) this.cache.set(reading.group, [])
    const arr = this.cache.get(reading.group)!
    arr.push(reading)
    if (arr.length > MAX_PER_GROUP) arr.splice(0, arr.length - MAX_PER_GROUP)
    this.lastUpdated = reading.timestamp
  }

  private async loadHistory() {
    const res = await fetch(tsUrl({ results: '200' })).catch(() => null)
    if (!res?.ok) { this.logger.warn('ThingSpeak history fetch failed'); return }
    const json = await res.json() as { feeds?: Array<Record<string, string>> }
    const feeds = parseFeeds(json.feeds ?? [])
    for (const r of feeds) { this.addToCache(r); if (r.entryId > this.lastEntryId) this.lastEntryId = r.entryId }
    this.logger.log(`History loaded — ${feeds.length} readings, groups: [${[...this.cache.keys()].join(', ')}]`)
  }

  private async poll() {
    const res = await fetch(tsUrl({ results: '10' })).catch(() => null)
    if (!res?.ok) return
    const json = await res.json() as { feeds?: Array<Record<string, string>> }
    const feeds = parseFeeds(json.feeds ?? []).filter(r => r.entryId > this.lastEntryId)
    if (!feeds.length) return

    for (const reading of feeds) {
      this.addToCache(reading)
      if (reading.entryId > this.lastEntryId) this.lastEntryId = reading.entryId
      await this.broadcast(reading)
    }
    this.logger.log(`Poll: ${feeds.length} new reading(s)`)
  }

  private async broadcast(reading: SensorReading) {
    this.sockets.monitoreoUpdateAdmins(reading)
    const groups = await this.prisma.group.findMany({
      where: { course: reading.group },
      select: { id: true },
    })
    for (const g of groups) this.sockets.monitoreoUpdateGroup(g.id, reading)
  }

  getAll(): MonitoreoResponse {
    const readings: Record<string, SensorReading[]> = {}
    for (const [group, arr] of this.cache.entries()) readings[group] = arr
    return { readings, lastUpdated: this.lastUpdated }
  }

  async getForGroupId(groupId: string): Promise<MonitoreoResponse> {
    const group = await this.prisma.group.findUnique({ where: { id: groupId }, select: { course: true } })
    if (!group) return { readings: {}, lastUpdated: this.lastUpdated }
    const arr = this.cache.get(group.course) ?? []
    return { readings: { [group.course]: arr }, lastUpdated: this.lastUpdated }
  }
}
