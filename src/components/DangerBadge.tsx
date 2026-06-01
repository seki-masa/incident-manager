import { getDangerColor, DANGER_LABELS } from '@/lib/hazardColors'

export function DangerBadge({ level }: { level: number }) {
  const color = getDangerColor(level)
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      Lv{level} {DANGER_LABELS[level]}
    </span>
  )
}
