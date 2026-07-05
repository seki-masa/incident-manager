'use client'

import { useState, useEffect } from 'react'
import { CreateHazardInput, HazardType, HazardStatus } from '@/types/hazard'
import { HAZARD_TYPE_LABELS, DANGER_LABELS } from '@/lib/hazardColors'

interface Props {
  lat: number
  lng: number
  /** null = 取得中, '' = 取得失敗/海上, string = 住所 */
  initialPrefecture?: string | null
  onSubmit: (data: CreateHazardInput) => Promise<void>
  onClose: () => void
}

export function HazardForm({ lat, lng, initialPrefecture, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    type: 'earthquake' as HazardType,
    title: '',
    description: '',
    prefecture: '',
    dangerLevel: 3,
    status: 'active' as HazardStatus,
    occurredAt: new Date().toISOString().slice(0, 16),
  })
  const [loading, setLoading] = useState(false)

  // 住所が取得できたら未入力の場合のみ自動入力
  useEffect(() => {
    if (typeof initialPrefecture === 'string' && initialPrefecture && !form.prefecture) {
      setForm((prev) => ({ ...prev, prefecture: initialPrefecture }))
    }
  // form.prefecture を依存に含めると手動入力後に上書きされるため意図的に除外
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrefecture])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...form,
        lat,
        lng,
        occurredAt: new Date(form.occurredAt).toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000]">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">新規ハザード登録</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          緯度: {lat.toFixed(5)} / 経度: {lng.toFixed(5)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">種別</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as HazardType })}
            >
              {Object.entries(HAZARD_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              required
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">詳細説明</label>
            <textarea
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">危険レベル</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                value={form.dangerLevel}
                onChange={(e) => setForm({ ...form, dangerLevel: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>Lv{n} {DANGER_LABELS[n]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                場所
                {initialPrefecture === null && (
                  <span className="ml-1 text-gray-500">（取得中...）</span>
                )}
              </label>
              <input
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                placeholder={initialPrefecture === null ? '取得中...' : '例: 東京都千代田区'}
                value={form.prefecture}
                onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">発生日時</label>
            <input
              type="datetime-local"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
              value={form.occurredAt}
              onChange={(e) => setForm({ ...form, occurredAt: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-sm border border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
