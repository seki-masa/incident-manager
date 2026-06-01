export type HazardType =
  | 'earthquake'
  | 'tsunami'
  | 'typhoon'
  | 'flood'
  | 'fire'
  | 'volcanic'
  | 'military'
  | 'other'

export type HazardStatus = 'active' | 'monitoring' | 'resolved'

export interface Hazard {
  id: string
  type: HazardType
  title: string
  description: string
  lat: number
  lng: number
  prefecture?: string
  dangerLevel: number
  status: HazardStatus
  occurredAt: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateHazardInput {
  type: HazardType
  title: string
  description: string
  lat: number
  lng: number
  prefecture?: string
  dangerLevel: number
  status?: HazardStatus
  occurredAt: string
}
