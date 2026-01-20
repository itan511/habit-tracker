
import { create } from 'zustand'
import { habitsApi } from '@/services/habitsApi'
import { format } from 'date-fns'

type State = {
  habits: import('@/services/habitsApi').Habit[]
  loading: boolean
  fetch: ()=>Promise<void>
  toggleToday: (id:number)=>Promise<void>
}

export const useHabitStore = create<State>((set,get)=> ({
  habits: [],
  loading: false,
  async fetch(){
    set({loading:true})
    try {
      const data = await habitsApi.getAll()
      // Убедимся, что data не null и является массивом
      const habitsData = Array.isArray(data) ? data : []
      set({habits: habitsData, loading:false})
    } catch (error) {
      console.error('Error fetching habits:', error)
      set({habits: [], loading:false})
    }
  },
  async toggleToday(id:number){
    const today = format(new Date(), 'yyyy-MM-dd')
    const currentHabits = get().habits || []
    const h = currentHabits.find(h=>h.id===id)
    const done = !(h?.history?.find(x=>x.date===today)?.done ?? false)
    try {
      await habitsApi.updateProgress(id, today, done)
      await get().fetch()
    } catch (error) {
      console.error('Error updating habit progress:', error)
    }
  }
}))
