import { buildRouletteSegments } from "../lib/roulette"

type Row = {
  id: number
  name: string
  adjustedWeight: number
}

type Props = {
  rows: Row[]
  rotation: number
}

export default function RouletteWheel({ rows, rotation }: Props) {
  const entries = rows.map((row) => ({
    item: row,
    weight: row.adjustedWeight,
  }))

  const segmentsData = buildRouletteSegments(entries)

  const colors = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ]

  const segments = segmentsData.map((segment, i) => {
    return `${colors[i % colors.length]} ${segment.startAngle}deg ${segment.endAngle}deg`
  })

  const gradient =
    segments.length > 0
      ? `conic-gradient(${segments.join(",")})`
      : "conic-gradient(#cbd5e1 0deg 360deg)"

  const size = 256
  const center = size / 2
  const labelRadius = size * 0.33

  return (
    <div className="flex justify-center">
      <div className="relative h-64 w-64">
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
          <div className="h-0 w-0 border-l-8 border-r-8 border-t-[20px] border-l-transparent border-r-transparent border-t-red-600" />
        </div>

        <div
          className="relative h-full w-full rounded-full border-8 border-slate-300 shadow-lg transition-transform duration-[3000ms]"
          style={{
            background: gradient,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {segmentsData.map((segment) => {
            const theta = ((segment.centerAngle - 90) * Math.PI) / 180
            const x = center + labelRadius * Math.cos(theta)
            const y = center + labelRadius * Math.sin(theta)

            return (
              <div
                key={segment.item.id}
                className="absolute z-10 max-w-[72px] -translate-x-1/2 -translate-y-1/2 text-center text-xs font-semibold leading-tight text-white drop-shadow pointer-events-none"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                }}
              >
                {segment.item.name}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
