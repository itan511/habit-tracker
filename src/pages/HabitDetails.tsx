
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/mocks/api'
import type { Habit } from '@/mocks/types'
import { format } from 'date-fns'

export default function HabitDetails(){
  const { id } = useParams()
  const [habit, setHabit] = useState<Habit|null>(null)
  useEffect(()=>{
    if (!id) return
    api.getHabit(Number(id)).then(setHabit)
  },[id])
  const toggleToday = async () => {
    if (!id) return
    const today = format(new Date(), 'yyyy-MM-dd')
    const current = habit?.history.find(x=>x.date===today)?.done ?? false
    await api.toggleProgress(Number(id), today, !current)
    setHabit(await api.getHabit(Number(id)))
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{habit?.name}</h1>
        <button onClick={toggleToday} className="bg-brand hover:bg-brand-dark px-4 py-2 rounded-xl">Отметить сегодня</button>
      </div>
      <div className="card p-4">
        <div className="text-sm text-[var(--text-muted)] mb-2">История</div>
        <div className="grid grid-cols-7 gap-2">
          {habit?.history.slice(-28).map(h => (
            <div key={h.date} className={'h-8 rounded-lg ' + (h.done ? 'bg-green-500/70' : 'bg-white/10 dark:bg-white/10')} title={h.date} />
          ))}
        </div>
      </div>
    </div>
  )
}
