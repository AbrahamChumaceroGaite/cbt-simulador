import type { PlantasRole, SessionPayload } from '@simulador/shared'
export type { PlantasRole, SessionPayload }

export interface UserEntity {
  id:           string
  code:         string
  passwordHash: string
  role:         string
  fullName:     string
  isActive:     boolean
  createdAt:    Date
}
