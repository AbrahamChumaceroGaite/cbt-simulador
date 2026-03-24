import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simulador de Plantas — STEAM GP S8',
  description: 'Simulador de crecimiento vegetal para Cambridge Global Perspectives',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
