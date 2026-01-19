
export type HistoryPoint = { date: string; done: boolean }
export type Habit = {
  id: number
  name: string
  description?: string
  stats: { streak: number; completion_rate: number }
  history: HistoryPoint[]
  competitionId?: number
}
export type User = {
  id: number
  username: string
  email: string
}
export type Comment = { id: number; author: User; text: string; created_at: string }
