import { useEffect, useState } from 'react';
import { useHabitStore } from '@/stores/habits';
import { useCompetitionStore } from '@/stores/competitions';
import HabitCard from '@/components/HabitCard';
import { api } from '@/mocks/api';
import type { Habit } from '@/mocks/types';

export default function Dashboard(){
  const { habits, fetch, loading, toggleToday } = useHabitStore()
  const { competitions, fetch: fetchCompetitions } = useCompetitionStore()
  const [competitionHabits, setCompetitionHabits] = useState<Habit[]>([])

  useEffect(()=>{
    fetch()
    fetchCompetitions()
    // fetch habits again after competitions loaded
    api.getHabits().then(allHabits => {
      setCompetitionHabits(allHabits.filter(h => h.competitionId))
    })
  },[])

  const regularHabits = habits.filter(h => !h.competitionId)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Мои привычки</h1>
      {loading && <div>Загрузка...</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regularHabits.map(h => (
          <div key={h.id} className="space-y-2">
            <HabitCard habit={h} showToggleBtn={false}/>
            <button onClick={()=>toggleToday(h.id)} className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-2">
              Переключить «сегодня»
            </button>
          </div>
        ))}
      </div>
      {competitionHabits.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8">Привычки соревнований</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitionHabits.map(h => (
              <div key={h.id} className="space-y-2">
                <HabitCard habit={h} showToggleBtn={false}/>
                <button onClick={()=>toggleToday(h.id)} className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-2">
                  Переключить «сегодня»
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
