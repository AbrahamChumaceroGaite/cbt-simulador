import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEMO_GROUP, DEMO_SIMULATION, DEMO_ENTRIES } from '../src/data/demo'

const prisma = new PrismaClient()

async function main() {
  try {
    // ── Admin user ────────────────────────────────────────────────────────────
    console.log('Seeding Admin user...')
    const passwordHash = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
      where: { code: 'admin' },
      update: {},
      create: { code: 'admin', passwordHash, fullName: 'Administrador', role: 'admin', isActive: true },
    })

    // ── Demo Group ────────────────────────────────────────────────────────────
    console.log('Seeding Demo Group...')
    const group = await prisma.group.upsert({
      where: { code: DEMO_GROUP.code },
      update: {},
      create: DEMO_GROUP,
    })

    console.log('Seeding Demo Simulation...')
    const sim = await prisma.simulation.upsert({
      where: { id: DEMO_SIMULATION.id },
      update: {},
      create: { ...DEMO_SIMULATION, groupId: group.id },
    })

    console.log('Seeding Demo Entries...')
    for (const e of DEMO_ENTRIES) {
      await prisma.entry.upsert({
        where: { id: e.id },
        update: {},
        create: { ...e, simulationId: sim.id },
      })
    }

    console.log('✅ Seed completed. Admin: code=admin / password=admin123 | Demo group code: DEMO')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
