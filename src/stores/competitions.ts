import { create } from 'zustand'
import type { User } from '@/mocks/types'
import { api } from '@/mocks/api'

export type Competition = {
  id: number
  name: string
  description?: string
  owner: User
  members: User[]
  created_at: string
}

type State = {
  competitions: Competition[]
  fetch: ()=>Promise<void>
  create: (payload: {name:string; description?:string; memberIds:number[]; habitName?:string})=>Promise<void>
}

export const useCompetitionStore = create<State>((set,get)=>({
  competitions: [],
  async fetch(){
    // simple persistent storage via localStorage
    const raw = localStorage.getItem('competitions')
    const data: Competition[] = raw ? JSON.parse(raw) : []
    set({competitions: data})
  },
  async create({name, description, memberIds, habitName}){
    const friends = await api.getFriends()
    const me = await api.getMe()
    const members = [me, ...friends.filter(f=>memberIds.includes(f.id))]
    const compId = Date.now()
    const comp: Competition = { id: compId, name, description, owner: me, members, created_at: new Date().toISOString() }
    const next = [...get().competitions, comp]
    localStorage.setItem('competitions', JSON.stringify(next))
    set({competitions: next})

    // create a habit that will be visible on the main page and marked with competitionId
    if(habitName){
      try{
        await api.createCompetitionHabit(habitName, description, compId)
      }catch(e){
        console.warn('Failed to create competition habit', e)
      }
    }
  }
}))
