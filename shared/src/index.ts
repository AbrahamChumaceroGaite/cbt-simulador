// Types
export type { IApiResponse }                               from './types/api-response'
export type { PlantasRole, SessionPayload }                from './types/session.types'
export type { UserResponse, CreateUserDto, UpdateUserDto, RestoreResult } from './types/user.types'
export type { GroupResponse, GroupInput }                  from './types/group.types'
export type { MemberResponse, MemberInput }                from './types/member.types'
export type { SimulationResponse, SimulationInput, SimulationUpdateInput } from './types/simulation.types'
export type { EntryResponse, EntryInput }                  from './types/entry.types'
export type { ClimateDay, ClimateSummary, ClimateResponse, WeatherDay } from './types/climate.types'
export type { GroupStatResponse }                          from './types/analytics.types'

// Growth model
export type { GrowthParams, DayConditions, ProjPoint }     from './lib/growth'
export {
  calcEffects, calcDailyGrowth, calcHeightAtDay,
  generateProjectionFromClimate,
} from './lib/growth'
