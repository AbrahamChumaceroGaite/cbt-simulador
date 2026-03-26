'use client'

interface RangeSliderProps {
  min: number
  max: number
  from: number
  to: number
  onChange: (from: number, to: number) => void
}

const THUMB_CLASS = 'absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-emerald-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-transparent'

export function RangeSlider({ min, max, from, to, onChange }: RangeSliderProps) {
  const lPct = ((from - min) / (max - min)) * 100
  const rPct = ((to   - min) / (max - min)) * 100
  return (
    <div className="relative h-8 flex items-center select-none">
      <div className="absolute h-1.5 w-full bg-zinc-700 rounded-full" />
      <div className="absolute h-1.5 bg-emerald-500 rounded-full"
        style={{ left: `${lPct}%`, width: `${rPct - lPct}%` }} />
      <input type="range" min={min} max={to - 7} step={1} value={from}
        onChange={e => onChange(+e.target.value, to)}
        className={THUMB_CLASS} />
      <input type="range" min={from + 7} max={max} step={1} value={to}
        onChange={e => onChange(from, +e.target.value)}
        className={THUMB_CLASS} />
    </div>
  )
}
