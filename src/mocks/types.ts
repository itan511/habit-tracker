
export type HistoryPoint = { date: string; done: boolean }
export type Habit = {
  id: number
  name: string
  description?: string
  stats: { streak: number; completion_rate: number }
  history: HistoryPoint[]
}
export type User = {
  id: number
  username: string
  name: string
  avatar?: string
  bio?: string
  tags?: string[]
}
export type Comment = { id: number; author: User; text: string; created_at: string }
