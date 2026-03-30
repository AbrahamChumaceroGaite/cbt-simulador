export interface GroupEntity {
  id:        string
  name:      string
  course:    string
  plant:     string
  code:      string
  createdAt: Date
  updatedAt: Date
  _count?:   { simulations: number; members: number }
}
