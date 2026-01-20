import { useEffect } from 'react';
import { useHabitStore } from '@/stores/habits';
import HabitCard from '@/components/HabitCard';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const { habits, fetch, loading, toggleToday } = useHabitStore()

  useEffect(()=>{
    fetch()
  },[])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Мои привычки</h1>
        <Link
          to="/new-habit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold"
        >
          Новая привычка
        </Link>
      </div>

      {loading && <div className="text-center py-8">Загрузка привычек...</div>}

      {!loading && habits.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">У вас пока нет привычек</h2>
          <p className="text-[var(--text-muted)] mb-4">
            Создайте свою первую привычку, чтобы начать отслеживание
          </p>
          <Link
            to="/new-habit"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl"
          >
            Создать привычку
          </Link>
        </div>
      )}

      {!loading && habits.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(h => (
            <div key={h.id} className="space-y-2">
              <HabitCard habit={h} showToggleBtn={false}/>
              <button
                onClick={()=>toggleToday(h.id)}
                className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-2 text-sm"
              >
                Переключить «сегодня»
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
