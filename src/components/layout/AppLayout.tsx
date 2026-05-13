import React from "react";
import { Sun, Moon, Activity, Bot, MessageCircle } from "lucide-react";
import { BackgroundBeams } from "../ui/background-beams";

type AppLayoutProps = {
  children: React.ReactNode;
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (path: string) => void;
  hideShell?: boolean;
};

export function AppLayout({
  children,
  isDark,
  toggleTheme,
  onNavigate,
  hideShell = false
}: AppLayoutProps) {
  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0F1115] text-gray-100' : 'bg-[#F8FAFC] text-slate-900'} font-sans selection:bg-indigo-500/30 transition-colors duration-500 overflow-x-hidden`}>
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <BackgroundBeams />
      </div>

      {!hideShell && (
        <nav className={`sticky top-0 z-50 ${isDark ? 'bg-[#16191F]/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-xl border-b transition-colors duration-500`}>
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
            <div 
              className="flex items-center gap-3 shrink-0 cursor-pointer"
              onClick={() => onNavigate("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className={`font-black text-xl tracking-tighter uppercase hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>DotaPulse</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate("/guestbook")}
                className={`hidden sm:flex items-center gap-2 px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl font-bold text-sm transition-all`}
              >
                <MessageCircle className="w-4 h-4" />
                留言板
              </button>

              <button
                onClick={() => onNavigate("/")}
                className={`hidden sm:flex items-center gap-2 px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl font-bold text-sm transition-all`}
              >
                <Bot className="w-4 h-4" />
                智能对话
              </button>

              <div className={`w-px h-6 mx-2 ${isDark ? 'bg-white/10' : 'bg-slate-200 hidden sm:block'}`}></div>

              <button
                onClick={toggleTheme}
                className={`p-3 ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'} border rounded-2xl transition-all active:scale-95`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className={`relative z-10 ${hideShell ? 'h-screen' : ''}`}>
        {children}
      </main>

      {!hideShell && (
        <footer className={`max-w-6xl mx-auto px-6 py-20 text-center border-t ${isDark ? 'border-white/5' : 'border-slate-100'} mt-20 transition-colors duration-500`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.8em] mb-4 select-none ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>分布式分析平台</p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-800' : 'text-slate-200'}`}>© 2026 NEURAL LINK PROTOCOL</p>
        </footer>
      )}
    </div>
  );
}
