import React from "react";
import { Sun, Moon, Activity, Bot, MessageCircle, LogIn, LogOut, Menu, X, UserRound } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { type AuthUser } from "../../context/AppContext";

type AppLayoutProps = {
  isDark: boolean;
  toggleTheme: () => void;
  user?: AuthUser | null;
  authLoading?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  children?: React.ReactNode;
};

const navItems = [
  { label: "角色大厅", to: "/", icon: Bot, exact: true },
  { label: "留言板", to: "/guestbook", icon: MessageCircle },
  { label: "Dota 数据", to: "/dota", icon: Activity },
];

export function AppLayout({
  isDark,
  toggleTheme,
  user,
  authLoading,
  onLogin,
  onLogout,
  children
}: AppLayoutProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const hideShell = location.pathname.startsWith("/chat/");
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (item: typeof navItems[number]) => {
    return item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
  };

  const navLinkClass = (active: boolean) => {
    return `w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
      active
        ? "bg-indigo-600 text-white"
        : isDark
          ? "text-slate-400 hover:bg-white/5 hover:text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;
  };

  const sidebar = (
    <aside className={`h-full w-72 border-r ${isDark ? "bg-[#10131A] border-white/5" : "bg-white border-slate-200"}`}>
      <div className="flex h-full flex-col px-4 py-5">
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className={`text-base font-black tracking-tight uppercase ${isDark ? "text-white" : "text-slate-950"}`}>
              Girlove
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Role Chat Studio
            </p>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.to} to={item.to} className={navLinkClass(active)}>
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`mt-auto rounded-3xl border p-4 ${isDark ? "border-white/5 bg-white/[0.03]" : "border-slate-200 bg-slate-50"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">当前账号</p>
          {authLoading ? (
            <div className={`mt-3 h-10 rounded-2xl animate-pulse ${isDark ? "bg-white/5" : "bg-slate-200"}`} />
          ) : user ? (
            <button onClick={onLogout} className="mt-3 flex w-full items-center gap-3 text-left">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name || user.email} className="h-9 w-9 rounded-full" />
              ) : (
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isDark ? "bg-white/5" : "bg-white"}`}>
                  <UserRound className="h-4 w-4 text-indigo-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{user.name || user.email}</p>
                <p className="text-[10px] font-bold text-slate-500">点击退出</p>
              </div>
              <LogOut className="h-4 w-4 text-slate-500" />
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              <LogIn className="h-4 w-4" />
              Google 登录
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div className={`flex flex-col min-h-screen ${isDark ? 'bg-[#0F1115] text-gray-100' : 'bg-[#F8FAFC] text-slate-900'} font-sans selection:bg-indigo-500/30 transition-colors duration-300 overflow-x-hidden relative`}>
      <div className={`fixed inset-0 z-0 pointer-events-none ${isDark ? "bg-[radial-gradient(circle_at_top,#172033_0%,transparent_34%)]" : "bg-[radial-gradient(circle_at_top,#e8eefc_0%,transparent_36%)]"}`} />

      {!hideShell && (
        <header className={`sticky top-0 z-50 h-16 border-b ${isDark ? 'bg-[#10131A] border-white/5' : 'bg-white border-slate-200'} transition-colors duration-300 shrink-0`}>
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                className={`lg:hidden h-10 w-10 rounded-2xl border flex items-center justify-center ${isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                aria-label="打开菜单"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>Girlove</p>
                <p className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-slate-500">AI role chat workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`h-10 w-10 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'} border rounded-2xl transition-colors flex items-center justify-center`}
                aria-label="切换主题"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {!hideShell && menuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
            aria-label="关闭菜单遮罩"
          />
          <div className="absolute left-0 top-0 h-full">
            {sidebar}
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute right-4 top-4 h-10 w-10 rounded-2xl bg-white text-slate-900 flex items-center justify-center"
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className={`relative z-10 flex flex-1 ${hideShell ? 'h-screen' : 'min-h-0'}`}>
        {!hideShell && (
          <div className="hidden lg:block shrink-0">
            {sidebar}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className={`flex-1 ${hideShell ? 'h-screen' : ''}`}>
            {children}
          </main>

          {!hideShell && (
            <footer className={`mx-auto w-full max-w-6xl px-6 py-8 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} transition-colors duration-300 shrink-0`}>
              <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] select-none ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
                  Girlove Workspace
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-800' : 'text-slate-300'}`}>
                  © {currentYear} Role Chat Protocol
                </p>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
