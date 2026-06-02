import { z } from 'zod'

const HAZARD_TYPES = [
  'earthquake', 'tsunami', 'typhoon', 'flood',
  'fire', 'volcanic', 'military', 'other',
] as const

const HAZARD_STATUSES = ['active', 'monitoring', 'resolved'] as const

export const CreateHazardSchema = z.object({
  type: z.enum(HAZARD_TYPES),
  title: z.string().min(1, '必須').max(200),
  description: z.string().max(2000).default(''),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  prefecture: z.string().max(100).optional(),
  dangerLevel: z.number().int().min(1).max(5),
  status: z.enum(HAZARD_STATUSES).default('active'),
  occurredAt: z.string().datetime(),
})

export const UpdateHazardSchema = z.object({
  type: z.enum(HAZARD_TYPES).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  prefecture: z.string().max(100).nullable().optional(),
  dangerLevel: z.number().int().min(1).max(5).optional(),
  status: z.enum(HAZARD_STATUSES).optional(),
  occurredAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
})

export const ListFilterSchema = z.object({
  type: z.enum(HAZARD_TYPES).optional(),
  status: z.enum(HAZARD_STATUSES).optional(),
  minLevel: z.coerce.number().int().min(1).max(5).optional(),
  maxLevel: z.coerce.number().int().min(1).max(5).optional(),
})
