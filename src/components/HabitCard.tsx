
import { Link } from 'react-router-dom'
import { Habit } from '@/services/habitsApi'
import ProgressRing from './ProgressRing'
import { format } from 'date-fns'

function pickIcon(name: string){
  const n = name.toLowerCase()
  if(n.includes('бег') || n.includes('run') || n.includes('jog')) return '🏃'
  if(n.includes('англ') || n.includes('english') || n.includes('eng')) return '🗣️'
  if(n.includes('чт') || n.includes('read') || n.includes('книг')) return '📚'
  if(n.includes('отжим') || n.includes('push') || n.includes('жим')) return '💪'
  return '🔖'
}

export default function HabitCard({habit, showToggleBtn = true}: {habit: Habit, showToggleBtn?: boolean}){
  // Проверяем, что все необходимые свойства существуют
  const history = habit.history || [];
  const stats = habit.stats || { streak: 0, completion_rate: 0 };

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayMark = history.find(h => h.date === today)?.done ?? false
  const statusColor = todayMark
    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
    : 'bg-blue-100 text-blue-700 dark:bg-sky-500/20 dark:text-sky-300'
  const icon = pickIcon(habit.name || '')
  return (
    <div>
      <Link to={`/habit/${habit.id}`} className={`card p-4 block hover:shadow-lg hover:-translate-y-1 transition`}>
        <div className="flex items-start justify-between gap-4 min-h-[110px]">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--card-accent)] flex items-center justify-center text-2xl">{icon}</div>
            <div>
              <div className="text-lg font-semibold text-[var(--text)]">{habit.name}</div>
              <div className="text-sm text-[var(--text-muted)]">{habit.description}</div>
            </div>
          </div>
          <ProgressRing progress={stats.completion_rate}/>
        </div>
        <div className={`mt-3 flex flex-wrap items-center gap-3 text-xs px-2 py-1 rounded-lg ${statusColor}`} style={{minHeight:'24px'}}>
          <span className="font-medium whitespace-nowrap">Сегодня: {todayMark ? 'выполнено' : 'запланировано'}</span>
          <span className="text-[var(--text-muted)] whitespace-nowrap">Streak: {stats.streak}д</span>
        </div>
      </Link>
      {showToggleBtn && (
        <button className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-2 mt-2">
          Переключить «сегодня»
        </button>
      )}
    </div>
  )
}
