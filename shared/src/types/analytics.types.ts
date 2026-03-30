export type GroupStatResponse = {
  id:           string
  name:         string
  course:       string
  plant:        string
  code:         string
  memberCount:  number
  simCount:     number
  totalEntries: number
  bestHeight:   number | null
  bestSimName:  string
  avgDiff:      number | null
}
