export const DANGER_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#eab308',
  3: '#f97316',
  4: '#ef4444',
  5: '#991b1b',
}

export const DANGER_LABELS: Record<number, string> = {
  1: '低危険',
  2: '注意',
  3: '警戒',
  4: '危険',
  5: '最高危険',
}

export const HAZARD_TYPE_LABELS: Record<string, string> = {
  earthquake: '地震',
  tsunami: '津波',
  typhoon: '台風',
  flood: '洪水',
  fire: '火災',
  volcanic: '火山',
  military: '軍事',
  other: 'その他',
}

export const STATUS_LABELS: Record<string, string> = {
  active: '発生中',
  monitoring: '監視中',
  resolved: '解除済',
}

export function getDangerColor(level: number): string {
  return DANGER_COLORS[level] ?? '#6b7280'
}
