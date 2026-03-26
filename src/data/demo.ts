export const DEMO_GROUP = {
  name: 'Grupo Tutorial',
  course: 'S2A',
  plant: 'Lechuga',
  code: 'DEMO',
}

export const DEMO_SIMULATION = {
  id: 'demo-sim-1',
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
}

export const DEMO_ENTRIES = [
  { id: 'demo-entry-1', sessionNum: 1, date: new Date('2026-03-23'), myPrediction: 2.5, realHeight: 2.0, temperature: 17.8, humidity: 70, lightHours: 12.2, note: 'inicio'  },
  { id: 'demo-entry-2', sessionNum: 2, date: new Date('2026-03-27'), myPrediction: 2.8, realHeight: 2.3, temperature: 17.2, humidity: 68, lightHours: 12.0, note: 'normal'  },
  { id: 'demo-entry-3', sessionNum: 3, date: new Date('2026-03-31'), myPrediction: 3.1, realHeight: 2.9, temperature: 16.8, humidity: 66, lightHours: 11.8, note: 'frío'    },
  { id: 'demo-entry-4', sessionNum: 4, date: new Date('2026-04-03'), myPrediction: 3.4, realHeight: 3.2, temperature: 16.1, humidity: 65, lightHours: 11.5, note: 'normal'  },
  { id: 'demo-entry-5', sessionNum: 5, date: new Date('2026-04-07'), myPrediction: 3.6, realHeight: 3.8, temperature: 15.9, humidity: 64, lightHours: 11.4, note: 'soleado' },
  { id: 'demo-entry-6', sessionNum: 6, date: new Date('2026-04-10'), myPrediction: 3.9, realHeight: 4.1, temperature: 15.5, humidity: 63, lightHours: 11.2, note: 'normal'  },
  { id: 'demo-entry-7', sessionNum: 7, date: new Date('2026-04-14'), myPrediction: 4.1, realHeight: 4.5, temperature: 15.0, humidity: 62, lightHours: 11.0, note: 'soleado' },
  { id: 'demo-entry-8', sessionNum: 8, date: new Date('2026-04-17'), myPrediction: 4.4, realHeight: 4.6, temperature: 14.5, humidity: 61, lightHours: 10.9, note: 'frío'    },
]
