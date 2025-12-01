
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/mocks/api'
import type { Habit, Comment } from '@/mocks/types'
import { format } from 'date-fns'

export default function HabitDetails(){
  const { id } = useParams()
  const [habit, setHabit] = useState<Habit|null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  useEffect(()=>{
    if (!id) return
    api.getHabit(Number(id)).then(setHabit)
    api.getComments(Number(id)).then(setComments)
  },[id])
  const toggleToday = async () => {
    if (!id) return
    const today = format(new Date(), 'yyyy-MM-dd')
    const current = habit?.history.find(x=>x.date===today)?.done ?? false
    await api.toggleProgress(Number(id), today, !current)
    setHabit(await api.getHabit(Number(id)))
  }
  const send = async () => {
    if (!id || !text.trim()) return
    const c = await api.addComment(Number(id), text.trim())
    setComments(prev => [...prev, c])
    setText('')
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{habit?.name}</h1>
        <button onClick={toggleToday} className="bg-brand hover:bg-brand-dark px-4 py-2 rounded-xl">Отметить сегодня</button>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-4 lg:col-span-2">
          <div className="text-sm text-[var(--text-muted)] mb-2">История</div>
          <div className="grid grid-cols-7 gap-2">
            {habit?.history.slice(-28).map(h => (
              <div key={h.date} className={'h-8 rounded-lg ' + (h.done ? 'bg-green-500/70' : 'bg-white/10 dark:bg-white/10')} title={h.date} />
            ))}
          </div>
        </div>
        <div className="card p-4 flex flex-col">
          <div className="text-sm text-[var(--text-muted)]">Комментарии</div>
          <div className="space-y-2 mt-2 max-h-60 overflow-auto pr-1">
            {comments.map(c => (
              <div key={c.id} className="bg-[var(--card-accent)] rounded-xl p-2">
                <div className="text-xs text-[var(--text-muted)]">{new Date(c.created_at).toLocaleString()}</div>
                <div>{c.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="Оставьте комментарий" className="flex-1 bg-[var(--card-accent)] px-3 py-2 rounded-xl outline-none"/>
            <button onClick={send} className="bg-[var(--brand)] hover:bg-[var(--brand-accent)] px-4 py-2 rounded-xl text-white">
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
