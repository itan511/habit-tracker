
import { useEffect } from 'react'
import { useHabitStore } from '@/stores/habits'
import HabitCard from '@/components/HabitCard'

export default function Dashboard(){
  const { habits, fetch, loading, toggleToday } = useHabitStore()
  useEffect(()=>{ fetch() },[])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Мои привычки</h1>
      {loading && <div>Загрузка...</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map(h => (
          <div key={h.id} className="space-y-2">
            <HabitCard habit={h}/>
            <button onClick={()=>toggleToday(h.id)} className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-2">
              Переключить «сегодня»
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
