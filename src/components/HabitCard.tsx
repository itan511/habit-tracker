
import { Link } from 'react-router-dom'
import { Habit } from '@/mocks/types'
import ProgressRing from './ProgressRing'
import { format } from 'date-fns'

export default function HabitCard({habit}: {habit: Habit}){
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayMark = habit.history.find(h => h.date === today)?.done ?? false
  const statusColor = todayMark ? 'bg-green-500/20 text-green-300' : 'bg-sky-500/20 text-sky-300'
  return (
    <Link to={`/habit/${habit.id}`} className="card p-4 block hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{habit.name}</div>
          <div className="text-sm text-[var(--muted)]">{habit.description}</div>
        </div>
        <ProgressRing progress={habit.stats.completion_rate}/>
      </div>
      <div className="mt-3 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg {statusColor}">
        <span className={statusColor}>Сегодня: {todayMark ? 'выполнено' : 'запланировано'}</span>
        <span className="text-white/50">Streak: {habit.stats.streak}д</span>
      </div>
    </Link>
  )
}
