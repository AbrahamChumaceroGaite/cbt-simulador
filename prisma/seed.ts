import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Demo group
  const demo = await prisma.group.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: {
      name: 'Grupo Tutorial',
      course: 'S2A',
      plant: 'Lechuga',
      code: 'DEMO',
    },
  })

  // Demo simulation with pre-loaded data
  const sim = await prisma.simulation.upsert({
    where: { id: 'demo-sim-1' },
    update: {},
    create: {
      id: 'demo-sim-1',
      groupId: demo.id,
      name: 'Simulación Tutorial',
      description: 'Ejemplo completo para entender cómo funciona el simulador.',
      isDemo: true,
      isLocked: true,
      plantName: 'Lechuga',
      initialHeight: 2.0,
      baseGrowth: 0.30,
      optimalTemp: 18.0,
      optimalHumidity: 65.0,
      optimalLight: 12.0,
      officialPrediction: 9.5,
      predictionNote: 'Elegimos 9.5 cm porque la tasa base da ~11 cm pero el otoño de Tarija reduce el crecimiento por temperatura y horas de luz menores.',
    },
  })

  // Pre-loaded entries for demo
  const demoEntries = [
    { s: 1, d: new Date('2026-03-23'), p: 2.5, r: 2.0,  t: 17.8, h: 70, l: 12.2, n: 'inicio' },
    { s: 2, d: new Date('2026-03-27'), p: 2.8, r: 2.3,  t: 17.2, h: 68, l: 12.0, n: 'normal' },
    { s: 3, d: new Date('2026-03-31'), p: 3.1, r: 2.9,  t: 16.8, h: 66, l: 11.8, n: 'frío' },
    { s: 4, d: new Date('2026-04-03'), p: 3.4, r: 3.2,  t: 16.1, h: 65, l: 11.5, n: 'normal' },
    { s: 5, d: new Date('2026-04-07'), p: 3.6, r: 3.8,  t: 15.9, h: 64, l: 11.4, n: 'soleado' },
    { s: 6, d: new Date('2026-04-10'), p: 3.9, r: 4.1,  t: 15.5, h: 63, l: 11.2, n: 'normal' },
    { s: 7, d: new Date('2026-04-14'), p: 4.1, r: 4.5,  t: 15.0, h: 62, l: 11.0, n: 'soleado' },
    { s: 8, d: new Date('2026-04-17'), p: 4.4, r: 4.6,  t: 14.5, h: 61, l: 10.9, n: 'frío' },
  ]

  for (const e of demoEntries) {
    await prisma.entry.upsert({
      where: { id: `demo-entry-${e.s}` },
      update: {},
      create: {
        id: `demo-entry-${e.s}`,
        simulationId: sim.id,
        sessionNum: e.s,
        date: e.d,
        myPrediction: e.p,
        realHeight: e.r,
        temperature: e.t,
        humidity: e.h,
        lightHours: e.l,
        note: e.n,
      },
    })
  }

  console.log('Seed completed — Demo group code: DEMO')
}

main().catch(console.error).finally(() => prisma.$disconnect())
