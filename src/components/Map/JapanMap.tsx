'use client'

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { Hazard } from '@/types/hazard'
import { HazardMarker } from './HazardMarker'

interface Props {
  hazards: Hazard[]
  onHazardClick: (hazard: Hazard) => void
  onMapClick: (lat: number, lng: number) => void
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function JapanMap({ hazards, onHazardClick, onMapClick }: Props) {
  return (
    <MapContainer
      center={[37, 137]}
      zoom={6}
      className="w-full h-full"
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {hazards.map((h) => (
        <HazardMarker key={h.id} hazard={h} onClick={onHazardClick} />
      ))}
    </MapContainer>
  )
}
