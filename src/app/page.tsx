'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Hazard, CreateHazardInput } from '@/types/hazard'
import { HazardHistory } from '@/components/HazardHistory'
import { HazardDetailPanel } from '@/components/HazardDetailPanel'
import { HazardForm } from '@/components/HazardForm'

const JapanMap = dynamic(() => import('@/components/Map/JapanMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <span className="text-gray-500 text-sm">地図を読み込み中...</span>
    </div>
  ),
})

const POLL_INTERVAL = 30_000

export default function HomePage() {
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [selected, setSelected] = useState<Hazard | null>(null)
  const [formCoords, setFormCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(t)
  }, [notification])

  // ポーリング中に編集中かどうかを追跡（再レンダリング不要なので ref）
  const isEditingRef = useRef(false)
  const selectedRef = useRef<Hazard | null>(null)
  useEffect(() => { selectedRef.current = selected }, [selected])

  const fetchHazards = useCallback(async () => {
    const fresh: Hazard[] = await fetch('/api/hazards').then((r) => r.json())
    setHazards(fresh)
    // 編集中でなければ選択中ハザードも最新版に同期
    if (!isEditingRef.current && selectedRef.current) {
      const updated = fresh.find((h) => h.id === selectedRef.current!.id)
      setSelected(updated ?? null)
    }
  }, [])

  // 初回取得
  useEffect(() => { fetchHazards().catch(console.error) }, [fetchHazards])

  // 30秒ポーリング
  useEffect(() => {
    const timer = setInterval(() => {
      fetchHazards().catch(() => { /* 通信エラーは無視 */ })
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [fetchHazards])

  const handleMarkerClick = useCallback((hazard: Hazard) => {
    setSelected(hazard)
    setFormCoords(null)
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setFormCoords({ lat, lng })
    setSelected(null)
  }, [])

  const handleFormSubmit = async (data: CreateHazardInput) => {
    const res = await fetch('/api/hazards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const newHazard: Hazard = await res.json()
    setHazards((prev) => [newHazard, ...prev])
    setFormCoords(null)
  }

  const handleStatusChange = async (id: string, status: Hazard['status']) => {
    const res = await fetch(`/api/hazards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const updated: Hazard = await res.json()
    setHazards((prev) => prev.map((h) => (h.id === id ? updated : h)))
    setSelected(updated)
  }

  // updatedAt を渡すと楽観的ロックを適用、省略すると強制上書き
  const handleUpdate = async (id: string, data: object, updatedAt?: string) => {
    const res = await fetch(`/api/hazards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ...(updatedAt && { updatedAt }) }),
    })

    if (res.status === 409) {
      const body = await res.json()
      const err = new Error('conflict') as Error & { current: Hazard }
      err.current = body.current
      throw err
    }

    if (res.status === 404) {
      // 別ユーザーに削除されていた — 不正なデータを state に入れず即クリーンアップ
      setHazards((prev) => prev.filter((h) => h.id !== id))
      setSelected(null)
      setNotification('このハザードは別のユーザーによって削除されました')
      throw new Error('deleted')
    }

    if (!res.ok) {
      throw new Error('update_failed')
    }

    const updated: Hazard = await res.json()
    setHazards((prev) => prev.map((h) => (h.id === id ? updated : h)))
    setSelected(updated)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/hazards/${id}`, { method: 'DELETE' })
    setHazards((prev) => prev.filter((h) => h.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const handleConflict = (current: Hazard) => {
    setSelected(current)
    setHazards((prev) => prev.map((h) => (h.id === current.id ? current : h)))
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <HazardHistory
        hazards={hazards}
        selectedId={selected?.id ?? null}
        onSelect={(h) => {
          setSelected(h)
          setFormCoords(null)
        }}
        onDelete={handleDelete}
      />

      <div className="flex-1 relative">
        <JapanMap
          hazards={hazards}
          onHazardClick={handleMarkerClick}
          onMapClick={handleMapClick}
        />

        <HazardDetailPanel
          hazard={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onStatusChange={handleStatusChange}
          onEditingChange={(v) => { isEditingRef.current = v }}
          onConflict={handleConflict}
        />
      </div>

      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[3000] bg-red-800 border border-red-600 text-white text-sm px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}

      {formCoords && (
        <HazardForm
          lat={formCoords.lat}
          lng={formCoords.lng}
          onSubmit={handleFormSubmit}
          onClose={() => setFormCoords(null)}
        />
      )}
    </div>
  )
}
