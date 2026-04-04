import type { PlantasRole } from './session.types'

export type UserResponse = {
  id:        string
  code:      string
  role:      PlantasRole
  fullName:  string
  isActive:  boolean
  createdAt: string
}

export type CreateUserDto = {
  code:     string
  password: string
  fullName: string
  role:     PlantasRole
}

export type UpdateUserDto = {
  fullName?: string
  password?: string
  isActive?: boolean
}

export type RestoreResult = {
  detected: string[]
  details: {
    groups?:      { created: number; updated: number }
    members?:     { created: number; updated: number }
    simulations?: { created: number; updated: number }
    entries?:     { created: number }
  }
}
