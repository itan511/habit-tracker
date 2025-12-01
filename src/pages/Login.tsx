import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  // Принудительно только dark theme
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark')
  }
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Ошибка входа");
    }
  };

  return (
  <div className="min-h-screen grid place-items-center p-6 bg-[#0b0f1a]">
      <form
        onSubmit={submit}
        className="card p-6 w-full max-w-sm space-y-3 rounded-2xl bg-[#181826] border border-slate-800 shadow-xl text-white font-sans"
        style={{ fontFamily: 'Inter, Arial, sans-serif' }}
      >
        <h1 className="text-xl font-semibold">Вход</h1>

        <div className="text-xs text-white/70 mb-2">
          Тестовые данные:<br />
          <span className="font-mono">Логин: <b>artur</b> <br/>Пароль: <b>12345</b></span>
        </div>

        {error && (
          <div className="text-red-400 text-sm mb-2">
            {error}
          </div>
        )}

        <input
          placeholder="Логин"
          value={username}
          onChange={(e) => setU(e.target.value)}
          className="bg-white/5 px-3 py-2 rounded-xl w-full text-white outline-none border border-slate-700 focus:ring-2 focus:ring-blue-500 font-sans"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setP(e.target.value)}
          className="bg-white/5 px-3 py-2 rounded-xl w-full text-white outline-none border border-slate-700 focus:ring-2 focus:ring-blue-500 font-sans"
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-2 text-white font-medium transition font-sans"
        >
          Войти
        </button>

        <div className="text-sm text-white/60 text-center font-sans">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-white hover:underline">
            Регистрация
          </Link>
        </div>
      </form>
    </div>
  );
}
