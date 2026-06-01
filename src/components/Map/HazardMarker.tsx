'use client'

import { useMemo } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { Hazard } from '@/types/hazard'
import { getDangerColor, HAZARD_TYPE_LABELS, STATUS_LABELS } from '@/lib/hazardColors'

interface Props {
  hazard: Hazard
  onClick: (hazard: Hazard) => void
}

function createDivIcon(color: string, level: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;
      background-color:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.5);
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:11px;font-weight:bold;
    ">${level}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export function HazardMarker({ hazard, onClick }: Props) {
  const color = hazard.status === 'resolved' ? '#6b7280' : getDangerColor(hazard.dangerLevel)
  const icon = useMemo(
    () => createDivIcon(color, hazard.dangerLevel),
    [color, hazard.dangerLevel]
  )

  return (
    <Marker
      position={[hazard.lat, hazard.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick(hazard) }}
    >
      <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
        <div className="text-sm font-medium">{hazard.title}</div>
        <div className="text-xs text-gray-500">
          {HAZARD_TYPE_LABELS[hazard.type]} — {STATUS_LABELS[hazard.status]}
        </div>
      </Tooltip>
    </Marker>
  )
}
