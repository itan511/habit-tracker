import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import {
  PlusCircle,
  LineChart,
  Users,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const base =
    "flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-medium transition-colors";
  const inactive = "text-slate-300 hover:bg-slate-800/80";
  const active = "bg-slate-800 text-slate-50";

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/95 backdrop-blur-lg flex flex-col">
        <div className="px-6 py-6 text-xl font-semibold tracking-tight">
          Habit Tracker
        </div>

        <nav className="px-3 space-y-1 flex-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Главная</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            <LineChart className="w-4 h-4" />
            <span>Аналитика</span>
          </NavLink>

          <NavLink
            to="/friends"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            <Users className="w-4 h-4" />
            <span>Друзья</span>
          </NavLink>

          <button
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold py-2"
            onClick={() => navigate("/habit/new")}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Новая привычка</span>
          </button>
        </nav>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="m-4 flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </aside>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
