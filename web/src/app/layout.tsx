import type { Metadata } from 'next'
import './globals.css'
import { ConditionalSocketProvider } from '@/components/shared/ConditionalSocketProvider'

export const metadata: Metadata = {
  title: 'CBT S.T.E.A.M #2 - Plant Diary',
  description: 'Simulador de crecimiento vegetal — CBT S.T.E.A.M #2 Plant Diary',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        <ConditionalSocketProvider>{children}</ConditionalSocketProvider>
      </body>
    </html>
  )
}
