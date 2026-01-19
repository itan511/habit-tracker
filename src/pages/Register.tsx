
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Link, useNavigate } from 'react-router-dom'

export default function Register(){
  const [username, setU] = useState('')
  const [password, setP] = useState('')
  const [name, setN] = useState('')
  const [email, setEmail] = useState('')
  const register = useAuthStore(s=>s.register)
  const navigate = useNavigate()
  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    await register({username, password, name, email})
    navigate('/dashboard')
  }
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="card p-6 w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Регистрация</h1>
        <input placeholder="Имя" value={name} onChange={e=>setN(e.target.value)} className="bg-white/5 px-3 py-2 rounded-xl w-full"/>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="bg-white/5 px-3 py-2 rounded-xl w-full"/>
        <input placeholder="Логин" value={username} onChange={e=>setU(e.target.value)} className="bg-white/5 px-3 py-2 rounded-xl w-full"/>
        <input type="password" placeholder="Пароль" value={password} onChange={e=>setP(e.target.value)} className="bg-white/5 px-3 py-2 rounded-xl w-full"/>
        <button className="w-full bg-brand hover:bg-brand-dark rounded-xl py-2">Создать</button>
        <div className="text-sm text-white/60">Есть аккаунт? <Link to="/login" className="text-white">Войти</Link></div>
      </form>
    </div>
  )
}
