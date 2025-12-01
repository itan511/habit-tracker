
import { habits, me, friends, comments, saveHabits } from './data'
import { Habit, User, Comment } from './types'

const wait = (ms:number) => new Promise(r => setTimeout(r, ms))

const mockUsers = [
  { username: "artur", password: "12345", id: 1, name: "Артур" },
  { username: "nastya", password: "0000", id: 2, name: "Настя" },
  { username: "demo", password: "demo", id: 3, name: "Demo User" }
];

export const api = {
  async login(username: string, password: string) {
    await new Promise(res => setTimeout(res, 300)); // задержка как будто API

    const user = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      throw new Error("Неверный логин или пароль");
    }

    return {
      token: "mock-jwt-" + user.id,
      user
    };
  },

  async register(payload: {username:string; password:string; name:string}){
    await wait(300)
    return { id: 99, ...payload }
  },
  async getMe(): Promise<User> { await wait(200); return me },
  async getHabits(): Promise<Habit[]> { await wait(200); return habits },
  async getHabit(id:number): Promise<Habit> {
    await wait(200)
    const h = habits.find(h=>h.id===id)
    if (!h) throw new Error('Not found')
    return h
  },
  async toggleProgress(id:number, date:string, done:boolean){
    await wait(150)
    const h = habits.find(h=>h.id===id)
    if (!h) throw new Error('Not found')
    const p = h.history.find(x=>x.date===date)
    if (p) p.done = done
    else h.history.push({date, done})
    return h
  },
  async getHabitStats(id:number){
    await wait(150)
    const h = habits.find(h=>h.id===id)!
    return h.stats
  },
  async getComments(habitId:number): Promise<Comment[]> { await wait(120); return comments[habitId] ?? [] },
  async addComment(habitId:number, text:string): Promise<Comment> {
    await wait(120)
    const c = { id: Date.now(), author: me, text, created_at: new Date().toISOString() }
    comments[habitId] = [...(comments[habitId] ?? []), c]
    return c
  },
  async getFriends(): Promise<User[]> { await wait(200); return friends },
  async addFriend(tag:string): Promise<User> { await wait(200); return { id: Date.now(), username: tag, name: tag } },
  async deleteHabit(id:number){
    await wait(100)
    const idx = habits.findIndex(h=>h.id===id)
    if(idx>-1) {
      habits.splice(idx,1)
      saveHabits()
    }
    return true
  },
  async createCompetitionHabit(habitName: string, description: string | undefined, competitionId: number): Promise<Habit> {
    await wait(150)
    const id = Date.now()
    const h: Habit = {
      id,
      name: habitName,
      description,
      stats: { streak: 0, completion_rate: 0 },
      history: [],
      competitionId
    }
    habits.push(h)
    saveHabits()
    return h
  },
}
