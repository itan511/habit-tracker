import { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    try{
      const t = localStorage.getItem('theme')
      if(t === 'light' || t === 'dark') return t
      // fallback to system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    }catch{ return 'dark' }
  })

  useEffect(()=>{
    const root = document.documentElement
    if(theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    try{ localStorage.setItem('theme', theme) }catch{}
  },[theme])

  return (
    <button
      onClick={()=> setTheme(t => t === 'dark' ? 'light' : 'dark')}
      title="Сменить тему"
      className="ml-2 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
      aria-pressed={theme === 'dark'}
    >
      {theme === 'dark' ? '🌙 Тёмная' : '🌞 Светлая'}
    </button>
  )
}
