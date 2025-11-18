
import { Habit, User, Comment } from './types'
import { format, subDays } from 'date-fns'

const today = new Date()
const days = (n:number) => format(subDays(today, n), 'yyyy-MM-dd')

export const me: User = { id: 1, username: 'saribekyan', name: 'Сарибекян А.К.', tags: ['frontend','goals'] }

const history = (len:number) => Array.from({length: len}).map((_,i) => ({
  date: days(len-i-1),
  done: Math.random() > 0.3
}))

export const habits: Habit[] = [
  { id: 12, name: 'Утренний бег', description: '3 км', stats: { streak: 8, completion_rate: 83 }, history: history(30) },
  { id: 13, name: 'Английский 20 мин', stats: { streak: 3, completion_rate: 72 }, history: history(30) },
  { id: 14, name: 'Чтение 15 мин', stats: { streak: 12, completion_rate: 90 }, history: history(30) },
  { id: 15, name: 'Отжимания', stats: { streak: 1, completion_rate: 55 }, history: history(30) }
]

export const friends: User[] = [
  { id: 2, username: 'maxon', name: 'Максон' },
  { id: 3, username: 'lev', name: 'Лёва' },
  { id: 4, username: 'nastya', name: 'Настя' }
]

export const comments: Record<number, Comment[]> = {
  12: [
    { id: 1, author: friends[0], text: 'Красавчик!', created_at: days(1) },
    { id: 2, author: friends[1], text: 'Жми streak!', created_at: days(2) }
  ]
}
