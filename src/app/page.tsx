'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
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

export default function HomePage() {
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [selected, setSelected] = useState<Hazard | null>(null)
  const [formCoords, setFormCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    fetch('/api/hazards')
      .then((r) => r.json())
      .then(setHazards)
      .catch(console.error)
  }, [])

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

  const handleUpdate = async (id: string, data: object) => {
    const res = await fetch(`/api/hazards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated: Hazard = await res.json()
    setHazards((prev) => prev.map((h) => (h.id === id ? updated : h)))
    setSelected(updated)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/hazards/${id}`, { method: 'DELETE' })
    setHazards((prev) => prev.filter((h) => h.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="flex h-screen overflow-hidden">
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
        />
      </div>

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
