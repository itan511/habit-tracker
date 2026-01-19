
import { create } from 'zustand'
import { api } from '@/mocks/api'
import type { Habit } from '@/mocks/types'
import { format } from 'date-fns'

type State = {
  habits: Habit[]
  loading: boolean
  fetch: ()=>Promise<void>
  toggleToday: (id:number)=>Promise<void>
}

export const useHabitStore = create<State>((set,get)=> ({
  habits: [],
  loading: false,
  async fetch(){
    set({loading:true})
    const data = await api.getHabits()
    set({habits: data, loading:false})
  },
  async toggleToday(id:number){
    const today = format(new Date(), 'yyyy-MM-dd')
    const h = get().habits.find(h=>h.id===id)
    const done = !(h?.history.find(x=>x.date===today)?.done ?? false)
    await api.toggleProgress(id, today, done)
    await get().fetch()
  }
}))
