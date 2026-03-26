'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, Leaf } from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui'

type Sim = {
  id: string; name: string; description: string; plantName: string
  isDemo: boolean; isLocked: boolean; officialPrediction: number | null
  _count: { entries: number }
  entries: { realHeight: number | null }[]
}

export function SimCard({ sim, groupId }: { sim: Sim; groupId: string }) {
  const router   = useRouter()
  const lastReal = sim.entries[0]?.realHeight
  const sessions = sim._count.entries

  return (
    <Card
      className="cursor-pointer hover:border-zinc-700 transition-colors active:scale-[0.99]"
      onClick={() => router.push(`/grupo/${groupId}/simulacion/${sim.id}`)}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${sim.isDemo ? 'bg-violet-950 border border-violet-900' : 'bg-zinc-800 border border-zinc-700'}`}>
            {sim.isDemo ? <Leaf className="w-4 h-4 text-violet-400" /> : <BarChart3 className="w-4 h-4 text-zinc-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-white">{sim.name}</p>
              {sim.isDemo && <Badge variant="demo">Tutorial</Badge>}
              {sim.isLocked && !sim.isDemo && <Badge variant="amber">Predicción bloqueada</Badge>}
              {sim.officialPrediction && <Badge variant="blue">Pred: {sim.officialPrediction} cm</Badge>}
            </div>
            {sim.description && <p className="text-xs text-zinc-500 mt-0.5 truncate">{sim.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
              <span>{sessions} sesión{sessions !== 1 ? 'es' : ''}</span>
              {lastReal != null && <span>Última medida: <span className="text-zinc-400">{lastReal} cm</span></span>}
              {sim.plantName && <span>{sim.plantName}</span>}
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-zinc-600 rotate-180 flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  )
}
