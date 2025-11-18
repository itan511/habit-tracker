import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
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
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={submit}
        className="card p-6 w-full max-w-sm space-y-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl"
      >
        <h1 className="text-xl font-semibold text-white">Вход</h1>

        {error && (
          <div className="text-red-400 text-sm mb-2">
            {error}
          </div>
        )}

        <input
          placeholder="Логин"
          value={username}
          onChange={(e) => setU(e.target.value)}
          className="bg-white/5 px-3 py-2 rounded-xl w-full text-white outline-none border border-slate-700 focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setP(e.target.value)}
          className="bg-white/5 px-3 py-2 rounded-xl w-full text-white outline-none border border-slate-700 focus:ring-2 focus:ring-blue-500"
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-2 text-white font-medium transition"
        >
          Войти
        </button>

        <div className="text-sm text-white/60 text-center">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-white hover:underline">
            Регистрация
          </Link>
        </div>
      </form>
    </div>
  );
}
