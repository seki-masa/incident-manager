'use client'

import { useState, useEffect } from 'react'
import { Hazard, HazardType, HazardStatus } from '@/types/hazard'
import { DangerBadge } from './DangerBadge'
import { HAZARD_TYPE_LABELS, STATUS_LABELS, DANGER_LABELS } from '@/lib/hazardColors'

interface Props {
  hazard: Hazard | null
  onClose: () => void
  onUpdate: (id: string, data: object, updatedAt?: string) => Promise<void>
  onStatusChange: (id: string, status: Hazard['status']) => void
  onEditingChange?: (editing: boolean) => void
  onConflict: (current: Hazard) => void
}

export function HazardDetailPanel({
  hazard,
  onClose,
  onUpdate,
  onStatusChange,
  onEditingChange,
  onConflict,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    type: 'earthquake' as HazardType,
    title: '',
    description: '',
    prefecture: '',
    dangerLevel: 3,
    status: 'active' as HazardStatus,
    occurredAt: '',
  })
  const [saving, setSaving] = useState(false)
  const [conflictHazard, setConflictHazard] = useState<Hazard | null>(null)

  useEffect(() => {
    setEditing(false)
    setConflictHazard(null)
  }, [hazard?.id])

  const changeEditing = (v: boolean) => {
    setEditing(v)
    onEditingChange?.(v)
  }

  const startEdit = () => {
    if (!hazard) return
    setForm({
      type: hazard.type as HazardType,
      title: hazard.title,
      description: hazard.description,
      prefecture: hazard.prefecture ?? '',
      dangerLevel: hazard.dangerLevel,
      status: hazard.status as HazardStatus,
      occurredAt: new Date(hazard.occurredAt).toISOString().slice(0, 16),
    })
    setConflictHazard(null)
    changeEditing(true)
  }

  const buildPayload = () => ({
    ...form,
    occurredAt: new Date(form.occurredAt).toISOString(),
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hazard) return
    setSaving(true)
    setConflictHazard(null)
    try {
      await onUpdate(hazard.id, buildPayload(), hazard.updatedAt)
      changeEditing(false)
    } catch (err: unknown) {
      const e = err as { message?: string; current?: Hazard }
      if (e.message === 'conflict' && e.current) {
        setConflictHazard(e.current)
      }
      // 'deleted' は page.tsx 側の通知バナーで処理済みのため何もしない
    } finally {
      setSaving(false)
    }
  }

  const handleForceSave = async () => {
    if (!hazard) return
    setSaving(true)
    try {
      // updatedAt を省略 → サーバー側は競合チェックをスキップ
      await onUpdate(hazard.id, buildPayload())
      changeEditing(false)
      setConflictHazard(null)
    } finally {
      setSaving(false)
    }
  }

  const handleSwitchToLatest = () => {
    if (!conflictHazard) return
    onConflict(conflictHazard)
    changeEditing(false)
    setConflictHazard(null)
  }

  if (!hazard) return null

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-gray-800 shadow-2xl z-[1000] overflow-y-auto border-l border-gray-700">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-base font-bold text-white pr-2 truncate">
          {editing ? 'ハザード編集' : hazard.title}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!editing && (
            <button
              onClick={startEdit}
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-700 rounded"
            >
              編集
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="p-4 space-y-3">
          {/* 競合エラー通知 */}
          {conflictHazard && (
            <div className="p-3 bg-yellow-900/40 border border-yellow-700 rounded space-y-2">
              <p className="text-yellow-300 text-xs font-medium">⚠ 他のユーザーが編集しました</p>
              <p className="text-yellow-200/70 text-xs">
                最終更新: {new Date(conflictHazard.updatedAt).toLocaleString('ja-JP')}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSwitchToLatest}
                  className="flex-1 px-2 py-1 rounded border border-yellow-600 text-yellow-300 hover:bg-yellow-900/50 text-xs"
                >
                  最新版を確認
                </button>
                <button
                  type="button"
                  onClick={handleForceSave}
                  disabled={saving}
                  className="flex-1 px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-xs disabled:opacity-50"
                >
                  強制上書き保存
                </button>
              </div>
            </div>
          )}

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
              <label className="text-xs text-gray-400 block mb-1">ステータス</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as HazardStatus })}
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">都道府県</label>
            <input
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
              placeholder="例: 東京都"
              value={form.prefecture}
              onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
            />
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

          <div className="text-xs text-gray-500">
            座標: {hazard.lat.toFixed(4)}, {hazard.lng.toFixed(4)}（変更不可）
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => { changeEditing(false); setConflictHazard(null) }}
              className="flex-1 px-3 py-2 rounded text-sm border border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-3 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <DangerBadge level={hazard.dangerLevel} />
            <span className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 rounded">
              {HAZARD_TYPE_LABELS[hazard.type]}
            </span>
            <span className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 rounded">
              {STATUS_LABELS[hazard.status]}
            </span>
          </div>

          {hazard.description && (
            <p className="text-gray-300 text-sm leading-relaxed">{hazard.description}</p>
          )}

          <div className="text-xs text-gray-400 space-y-1">
            <div>緯度: {hazard.lat.toFixed(4)} / 経度: {hazard.lng.toFixed(4)}</div>
            {hazard.prefecture && <div>都道府県: {hazard.prefecture}</div>}
            <div>発生日時: {new Date(hazard.occurredAt).toLocaleString('ja-JP')}</div>
            {hazard.resolvedAt && (
              <div>解除日時: {new Date(hazard.resolvedAt).toLocaleString('ja-JP')}</div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-2">ステータス変更</p>
            <div className="flex gap-2">
              {(['active', 'monitoring', 'resolved'] as Hazard['status'][]).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(hazard.id, s)}
                  className={`text-xs px-3 py-1 rounded border transition-colors ${
                    hazard.status === s
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
