'use client'

import { useState } from 'react'
import { Hazard } from '@/types/hazard'
import { DangerBadge } from './DangerBadge'
import { HAZARD_TYPE_LABELS, STATUS_LABELS } from '@/lib/hazardColors'

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

interface Props {
  hazards: Hazard[]
  selectedId: string | null
  onSelect: (hazard: Hazard) => void
  onDelete: (id: string) => void
}

export function HazardHistory({ hazards, selectedId, onSelect, onDelete }: Props) {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<number>(0)

  const filtered = hazards.filter((h) => {
    if (filterType !== 'all' && h.type !== filterType) return false
    if (filterStatus !== 'all' && h.status !== filterStatus) return false
    if (filterLevel > 0 && h.dangerLevel < filterLevel) return false
    return true
  })

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (window.confirm('このハザードを削除しますか？')) {
      onDelete(id)
    }
  }

  return (
    <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full z-10 flex-shrink-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-base font-bold">ハザード一覧</h1>
        <p className="text-xs text-gray-400 mt-0.5">{filtered.length} 件</p>
      </div>

      <div className="p-3 space-y-2 border-b border-gray-700">
        <select
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs text-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">全種別</option>
          {Object.entries(HAZARD_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">全ステータス</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs text-white"
            value={filterLevel}
            onChange={(e) => setFilterLevel(Number(e.target.value))}
          >
            <option value={0}>全レベル</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>Lv{n}以上</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((h) => (
          <div
            key={h.id}
            className={`relative flex border-b border-gray-700 transition-colors ${
              selectedId === h.id
                ? 'bg-gray-700 border-l-2 border-l-blue-500'
                : 'hover:bg-gray-700'
            }`}
          >
            <button
              onClick={() => onSelect(h)}
              className="flex-1 text-left px-4 py-3 pr-10"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm font-medium line-clamp-1 text-white">
                  {h.title}
                </span>
                <DangerBadge level={h.dangerLevel} />
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-gray-400">{HAZARD_TYPE_LABELS[h.type]}</span>
                <span className="text-xs text-gray-500">
                  {new Date(h.occurredAt).toLocaleDateString('ja-JP')}
                </span>
                <span className="text-xs text-gray-500">{STATUS_LABELS[h.status]}</span>
              </div>
            </button>
            <button
              onClick={(e) => handleDelete(e, h.id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors p-1"
              title="削除"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">該当なし</p>
        )}
      </div>
    </aside>
  )
}
